export class ChangePasswordRequestDto {
  email: string;
}

export class VerifyOtpAndChangePasswordDto {
  email: string;
  otp: string;
  newPassword: string;
}
