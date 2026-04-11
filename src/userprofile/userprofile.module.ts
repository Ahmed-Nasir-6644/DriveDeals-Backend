import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileService } from './userprofile.service';
import { UserProfileController } from './userprofile.controller';
import { UserProfile } from 'src/entities/userProfile.entity';
import { UsersModule } from 'src/users/users.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile]), UsersModule, CloudinaryModule],
  providers: [UserProfileService],
  controllers: [UserProfileController],
})
export class UserProfileModule {}
