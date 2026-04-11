import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { BlTokenService } from './blToken.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BLTokens } from 'src/entities/blacklistedTokens.entity';
import { MailModule } from 'src/mail/mail.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    RedisModule,
    MailModule,
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: '6561',
      signOptions: {expiresIn: '1d'},
    }),
    TypeOrmModule.forFeature([BLTokens]),
  ],
  providers: [AuthService, JwtStrategy, BlTokenService],
  controllers: [AuthController]
})
export class AuthModule {}
