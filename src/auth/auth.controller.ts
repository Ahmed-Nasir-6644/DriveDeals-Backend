import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { jwtAuthGuard } from './jwt-auth.guard';
import { BlTokenService } from './blToken.service';
import { Response } from 'express';
import { ChangePasswordRequestDto, VerifyOtpAndChangePasswordDto } from 'src/dtos/changePassword.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private blTokenService: BlTokenService,
    private readonly configService: ConfigService
  ) {}

  @Post('register')
  async register(
    @Body('first_name') first_name: string,
    @Body('last_name') last_name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(first_name, last_name, email, password);
  }

  @Get('verify')
  async verifyEmail(
    @Query('token') token: string,
    @Res() res:Response
  ){
    const ret = await this.authService.verifyEmail(token);
    if(ret.status==200) return res.redirect(`${this.configService.get<string>('FRONTEND_URL')}/verify-success`);     
    else return res.redirect(`${this.configService.get<string>('FRONTEND_URL')}/verify-failed`);

  }


  @Post('login-step1')
  async loginStep1(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.loginStep1(email, password);
  }

  @Post('login-step2')
  async loginStep2(
    @Body('tempToken') tempToken: string,
    @Body('otp') otp: string,
  ){
    return this.authService.loginStep2(tempToken, otp);
  }
  @UseGuards(jwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return { message: 'login in first' };
    const token = authHeader.split(' ')[1];
    if (!token) {
      return { message: 'Invalid Token Format' };
    }

    await this.blTokenService.add(token);
    return { message: 'Logged out successfully' };
  }

  @Post('request-password-change')
  async requestPasswordChangeOtp(@Body() dto: ChangePasswordRequestDto) {
    return this.authService.requestPasswordChangeOtp(dto.email);
  }

  @Post('verify-otp-and-change-password')
  async verifyOtpAndChangePassword(@Body() dto: VerifyOtpAndChangePasswordDto) {
    return this.authService.verifyOtpAndChangePassword(dto.email, dto.otp, dto.newPassword);
  }
}
