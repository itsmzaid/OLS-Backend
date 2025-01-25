import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  Length,
} from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ description: "The user's full name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "The user's email address" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "The user's phone number in the format +923XXXXXXXXX",
  })
  @IsNotEmpty()
  @Matches(/^\+923\d{9}$/, {
    message: 'Phone number must start with +923 and be followed by 9 digits',
  })
  phoneNo: string;

  @ApiProperty({
    description:
      "The user's password, must include at least 1 uppercase, 1 lowercase, and 1 digit",
  })
  @IsNotEmpty()
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/, {
    message:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 digit',
  })
  password: string;

  // Custom method to format the phone number
  static formatPhoneNumber(phoneNo: string): string {
    if (phoneNo.startsWith('03')) {
      return '+92' + phoneNo.slice(1);
    } else if (phoneNo.startsWith('3') && phoneNo.length === 10) {
      return '+92' + phoneNo;
    }
    throw new Error('Invalid phone number format');
  }
}
