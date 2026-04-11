import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BidsModule } from './bids/bids.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Ad } from './entities/ad.entity';
import { Bid } from './entities/bid.entity';
import { BLTokens } from './entities/blacklistedTokens.entity';
import { UserProfile } from './entities/userProfile.entity';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdsModule } from './ads/ads.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UserProfileModule } from './userprofile/userprofile.module';
import { ChatModule } from './chat/chat.module';
import { Message } from './entities/message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Ad, Bid, BLTokens, UserProfile, Message],
        autoLoadEntities: true,
        synchronize: true,
        // Connection pool settings for Aiven remote database
        poolSize: 10,
        extra: {
          connectionLimit: 10,
          waitForConnections: true,
          queueLimit: 0,
          enableKeepAlive: true,
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
    }),
    AdsModule,
    AuthModule,
    UsersModule,
    BidsModule,
    MailModule,
    RedisModule,
    CloudinaryModule,
    UserProfileModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
