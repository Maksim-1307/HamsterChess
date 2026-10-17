import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PublicUser } from '../src/auth/auth.types';

describe('Auth API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());
  const agent = () => request.agent(app.getHttpServer());

  const uniqueUsername = () => `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const PASSWORD = 'password123';

  function cookiesOf(res: request.Response): string[] {
    const header = res.headers['set-cookie'];
    return Array.isArray(header) ? header : header ? [header] : [];
  }

  function register(
    username: string,
    password: string = PASSWORD,
  ): request.Test {
    return http().post('/auth/register').send({ username, password });
  }

  describe('POST /auth/register', () => {
    it('creates a user, returns the public profile and sets auth cookies', async () => {
      const username = uniqueUsername();

      const res = await register(username).expect(201);

      expect(res.body).toEqual({ id: expect.any(String), username });
      const cookies = cookiesOf(res);
      expect(cookies.some((c) => c.startsWith('access_token='))).toBe(true);
      expect(cookies.some((c) => c.startsWith('refresh_token='))).toBe(true);
      expect(cookies.every((c) => c.includes('HttpOnly'))).toBe(true);
    });

    it('409s when the username is already taken', async () => {
      const username = uniqueUsername();
      await register(username).expect(201);

      await register(username).expect(409);
    });

    it('400s on a too short password', async () => {
      await register(uniqueUsername(), '123').expect(400);
    });

    it('400s on an invalid username', async () => {
      await register('bad name!').expect(400);
    });

    it('400s on an unknown field', async () => {
      await http()
        .post('/auth/register')
        .send({ username: uniqueUsername(), password: PASSWORD, admin: true })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('logs in with valid credentials and sets cookies', async () => {
      const username = uniqueUsername();
      await register(username).expect(201);

      const res = await http()
        .post('/auth/login')
        .send({ username, password: PASSWORD })
        .expect(200);

      expect(res.body).toEqual({ id: expect.any(String), username });
      expect(cookiesOf(res).some((c) => c.startsWith('access_token='))).toBe(
        true,
      );
    });

    it('401s on a wrong password', async () => {
      const username = uniqueUsername();
      await register(username).expect(201);

      await http()
        .post('/auth/login')
        .send({ username, password: 'wrong-password' })
        .expect(401);
    });

    it('401s for an unknown user', async () => {
      await http()
        .post('/auth/login')
        .send({ username: uniqueUsername(), password: PASSWORD })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('401s without a session', async () => {
      await http().get('/auth/me').expect(401);
    });

    it('returns the current user for an authenticated session', async () => {
      const session = agent();
      const username = uniqueUsername();
      const created = await session
        .post('/auth/register')
        .send({ username, password: PASSWORD })
        .expect(201);

      const res = await session.get('/auth/me').expect(200);

      expect(res.body).toEqual<PublicUser>({
        id: created.body.id,
        username,
      });
    });
  });

  describe('POST /auth/refresh', () => {
    it('401s without a refresh cookie', async () => {
      await http().post('/auth/refresh').expect(401);
    });

    it('issues a fresh pair of cookies', async () => {
      const session = agent();
      await session
        .post('/auth/register')
        .send({ username: uniqueUsername(), password: PASSWORD })
        .expect(201);

      const res = await session.post('/auth/refresh').expect(200);

      expect(res.body).toHaveProperty('id');
      expect(cookiesOf(res).some((c) => c.startsWith('refresh_token='))).toBe(
        true,
      );
    });
  });

  describe('POST /auth/logout', () => {
    it('clears the session so it is no longer valid', async () => {
      const session = agent();
      await session
        .post('/auth/register')
        .send({ username: uniqueUsername(), password: PASSWORD })
        .expect(201);
      await session.get('/auth/me').expect(200);

      await session.post('/auth/logout').expect(204);

      await session.get('/auth/me').expect(401);
      await session.post('/auth/refresh').expect(401);
    });
  });
});
