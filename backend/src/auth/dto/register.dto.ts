import { IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(3, 32)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'username may contain letters, digits and underscores only',
  })
  username!: string;

  @IsString()
  @Length(6, 64)
  password!: string;
}
