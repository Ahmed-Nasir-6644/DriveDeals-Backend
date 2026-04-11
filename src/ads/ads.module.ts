import { Module } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ad } from 'src/entities/ad.entity';
import { User } from 'src/entities/user.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule,
    TypeOrmModule.forFeature([Ad, User])],
  providers: [AdsService],
  controllers: [AdsController],
})
export class AdsModule {}
