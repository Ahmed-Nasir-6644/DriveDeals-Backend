import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class GetUserProfileDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
