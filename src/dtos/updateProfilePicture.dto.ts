import { IsString, IsNotEmpty, IsEmail, IsUrl } from 'class-validator';

export class UpdateProfilePictureDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  profilePictureUrl: string;
}
