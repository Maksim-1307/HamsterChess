import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { AppConfig } from '../config/configuration';
import { parseDurationToMs } from '../common/utils/duration';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type {
  AuthResult,
  JwtPayload,
  PublicUser,
  TokenPair,
} from './auth.types';
import type { CookieOptions } from './auth.cookies';
import {
  USER_REPOSITORY,
  User,
  UserRepository,
} from './persistence/user-repository.interface';

const PASSWORD_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.users.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException('Username is already taken');
    }

    const passwordHash = await hash(dto.password, PASSWORD_SALT_ROUNDS);
    const user = await this.users.create({ username: dto.username, passwordHash });
    return this.issueSession(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.users.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const passwordMatches = await compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return this.issueSession(user);
  }

  async refresh(refreshToken: string | undefined): Promise<AuthResult> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.users.findById(payload.sub);
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Session is no longer active');
    }

    const tokenMatches = await compare(refreshToken, user.refreshTokenHash);
    if (!tokenMatches) {
      throw new UnauthorizedException('Session is no longer active');
    }

    return this.issueSession(user);
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);
      if (payload.type === 'refresh') {
        await this.users.updateRefreshTokenHash(payload.sub, null);
      }
    } catch {
      // an invalid or already expired refresh token is fine on logout
    }
  }

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return this.toPublic(user);
  }

  cookieOptions(): CookieOptions {
    const auth = this.config.get('auth', { infer: true });
    return {
      secure: this.config.get('nodeEnv', { infer: true }) === 'production',
      accessMaxAge: parseDurationToMs(auth.accessTokenExpiresIn),
      refreshMaxAge: parseDurationToMs(auth.refreshTokenExpiresIn),
    };
  }

  private async issueSession(user: User): Promise<AuthResult> {
    const auth = this.config.get('auth', { infer: true });
    const payload = { sub: user.id, username: user.username };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' } satisfies JwtPayload,
        { expiresIn: auth.accessTokenExpiresIn as JwtSignOptions['expiresIn'] },
      ),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' } satisfies JwtPayload,
        { expiresIn: auth.refreshTokenExpiresIn as JwtSignOptions['expiresIn'] },
      ),
    ]);

    const refreshTokenHash = await hash(refreshToken, PASSWORD_SALT_ROUNDS);
    await this.users.updateRefreshTokenHash(user.id, refreshTokenHash);

    const tokens: TokenPair = { accessToken, refreshToken };
    return { user: this.toPublic(user), tokens };
  }

  private toPublic(user: User): PublicUser {
    return { id: user.id, username: user.username };
  }
}
