import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from '../entities/user.entity';

@Injectable()
export class MailService {
  private transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // true if using port 465
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });

    this.transporter.verify((err, success) => {
      if (err) console.error('SMTP connection error:', err);
      else console.log('MailService connected to SMTP server');
    });
  }

  async sendMail(to:string, subject: string, text: string){
    await this.transporter.sendMail({
      from: `"Drive Deals" <${this.configService.get<string>('MAIL_USER')}>`,
      to: to,
      subject: subject,
      text: text,
    })
  }
  async sendOtp(user: User, otp: string) {
    await this.transporter.sendMail({
      from: `"Drive Deals" <${this.configService.get<string>('MAIL_USER')}>`,
      to: user.email,
      subject: 'OTP for Login',
      text: `Hello Mr.${user.last_name},

Your One-Time Password (OTP) for logging in to Drive Deals is:

${otp}

This code will expire in 5 minutes.
If you did not request this login, please ignore this message.

Thank you,
The Drive Deals Team`,
      html: `<p>Hello Mr.${user.last_name},</p><p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    });
  }

  async sendVerificationEmail(email: string, link: string) {
    await this.transporter.sendMail({
      from: `"Drive Deals" <${this.configService.get<string>('MAIL_USER')}>`,
      to: email,
      subject: 'Verify Your Drive Deals Account',
      text: `Hello,

Thank you for signing up with Drive Deals!

To complete your registration and activate your account, please verify your email address by clicking the link below:

${link}

This link will expire in 15 minutes for security reasons. If you did not create an account with Drive Deals, you can safely ignore this message.

Best regards,
The Drive Deals Team
    `,
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Welcome to Drive Deals!</h2>
        <p>Thank you for signing up with <strong>Drive Deals</strong>. We're excited to have you on board.</p>
        <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify My Email
          </a>
        </p>
        <p>If the button above does not work, you can also copy and paste the following link into your browser:</p>
        <p><a href="${link}" style="color: #007bff;">${link}</a></p>
        <p style="font-size: 12px; color: #777;">
          This link will expire in 1 hour. If you did not request this, please ignore this email.
        </p>
        <p>Best regards,<br/>The Drive Deals Team</p>
      </div>
    `,
    });
  }
async sendNewBidNotification(email: string, adId: number, amount: number) {
  await this.transporter.sendMail({
    from: `"Drive Deals" <${this.configService.get<string>('MAIL_USER')}>`,
    to: email,
    subject: `New Bid Placed on Ad #${adId}`,
    text: `Hello,

A new bid has just been placed on Ad #${adId}.

Bid Amount: ${amount} Lacs

Log in to your Drive Deals account to view the updated bid activity.

Best regards,
The Drive Deals Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">New Bid Alert!</h2>
        <p>A new bid has been placed on <strong>Ad #${adId}</strong>.</p>
        
        <div style="margin: 15px 0; padding: 12px; background: #f1f1f1; border-left: 5px solid #007bff;">
          <p style="margin: 0; font-size: 16px;"><strong>Bid Amount:</strong> ${amount}</p>
        </div>

        <p>You can log in to your Drive Deals account to see all current bids on the ads.</p>

        <p style="font-size: 12px; color: #777;">
          If you did not expect this email, you can safely ignore it.
        </p>

        <p>Best regards,<br/>The Drive Deals Team</p>
      </div>
    `,
  });
}

}