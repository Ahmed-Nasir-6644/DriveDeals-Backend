import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async register(
    first_name: string,
    last_name: string,
    email: string,
    password: string,
  ) {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ForbiddenException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = this.jwtService.sign({ email });

    await this.redisService.set(
      `verify:${verificationToken}`,
      JSON.stringify({
        first_name,
        last_name,
        email,
        password: hashedPassword,
      }),
      60*60
    );

    const verifyUrl = `${this.configService.get<string>('BACKEND_URL')}/auth/verify?token=${verificationToken}`;
    await this.mailService.sendVerificationEmail(email, verifyUrl);

    return {message: 'Please check your email to verify your account '};
    // if (!existingUser) {
    //   const user = await this.userService.createUser(first_name, last_name, email, password);
    //   return { message: 'User registered successfully', user };
    // } else {
    //     throw new ForbiddenException('email already exists');
    //     }
  }

  async verifyEmail(token: string){
    try {
        const payload = this.jwtService.verify(token);
        const redisKey = `verify:${token}`;
        const cachedUser = await this.redisService.get(redisKey);

        if(!cachedUser){
            return {message:"Invalid or Expired verification token", status:401};
        }
        const userData = JSON.parse(cachedUser);

        const user  = await this.userService.createUser(
            userData.first_name,
            userData.last_name,
            userData.email,
            userData.password,
        );
        await this.redisService.del(redisKey);
        return {message: "Email verified successfully. You can now login in",status:200, user};
    } catch (error) {
        throw new UnauthorizedException(error||'verification failed');
    }
  }
  async loginStep1(email: string, password: string) { 
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid saad Credentials');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid Credentials');

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${user.id}`;
    await this.redisService.set(otpKey, otp, 5 * 60);
    await this.mailService.sendOtp(user, otp);
    return { tempToken: token };
  }
  async loginStep2(tempToken: string, otp: string) {
    try {
      const payload = this.jwtService.verify(tempToken);
      const userId = payload.sub;

      const otpKey = `otp:${userId}`;
      const cachedOtp = await this.redisService.get(otpKey);
      if (!cachedOtp) throw new UnauthorizedException('Expired OTP');
      else if (cachedOtp != otp) throw new UnauthorizedException('Invalid OTP');
      await this.redisService.del(otpKey);

      const user = await this.userService.findById(userId);
      const accessToken = this.jwtService.sign({
        sub: user?.id,
        email: user?.email,
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('OTP verification failed', error);
    }
  }

  async requestPasswordChangeOtp(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `password-change-otp:${user.id}`;
    await this.redisService.set(otpKey, otp, 5 * 60);
    await this.mailService.sendOtp(user, otp);

    return { message: 'OTP sent to your email' };
  }

  async verifyOtpAndChangePassword(email: string, otp: string, newPassword: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const otpKey = `password-change-otp:${user.id}`;
    const cachedOtp = await this.redisService.get(otpKey);

    if (!cachedOtp) {
      throw new UnauthorizedException('Expired OTP');
    }
    if (cachedOtp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(user.id, hashedPassword);
    await this.redisService.del(otpKey);

    return { message: 'Password changed successfully' };
  }

}
