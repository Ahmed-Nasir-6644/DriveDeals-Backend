import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from 'src/entities/userProfile.entity';
import { UsersService } from 'src/users/users.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    private usersService: UsersService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getUserProfile(email: string) {
    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find user profile
    const userProfile = await this.userProfileRepository.findOne({
      where: { userId: user.id },
    });

    return {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      profilePicture: userProfile?.profilePicture || null,
    };
  }

  async updateProfilePicture(email: string, file: Express.Multer.File) {
    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Upload image to Cloudinary
    const imageUrl = await this.cloudinaryService.uploadImage(file);
    if (!imageUrl) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    // Save or update profile picture URL in database
    let userProfile = await this.userProfileRepository.findOne({
      where: { userId: user.id },
    });

    if (!userProfile) {
      userProfile = this.userProfileRepository.create({
        userId: user.id,
        profilePicture: imageUrl,
      });
    } else {
      userProfile.profilePicture = imageUrl;
    }

    return await this.userProfileRepository.save(userProfile);
  }
}
