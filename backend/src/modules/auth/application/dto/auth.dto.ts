import { IsString, IsEmail, IsOptional, IsBoolean, Length, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsBoolean()
  remember_me?: boolean;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  full_name: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  confirm_password: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 20)
  document_number: string;

  @IsString()
  @IsNotEmpty()
  document_type: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  current_password: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  new_password: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  confirm_new_password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  new_password: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  confirm_new_password: string;
}

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class LogoutDto {
  @IsOptional()
  @IsString()
  refresh_token?: string;

  @IsOptional()
  @IsBoolean()
  all_sessions?: boolean;
} 