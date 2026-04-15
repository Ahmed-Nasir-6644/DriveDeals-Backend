import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class ChangePasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class VerifyOtpAndChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
