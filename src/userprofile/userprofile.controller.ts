import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserProfileService } from './userprofile.service';
import { GetUserProfileDto } from '../dtos/getUserProfile.dto';

@Controller('user-profile')
export class UserProfileController {
  constructor(private userProfileService: UserProfileService) {}

  @Post('get')
  async getUserProfile(@Body() dto: GetUserProfileDto) {
    return this.userProfileService.getUserProfile(dto.email);
  }

  @Post('update-picture')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePicture(
    @Body('email') email: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userProfileService.updateProfilePicture(email, file);
  }
}
