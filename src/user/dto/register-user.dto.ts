import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: 'abc@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'ABC' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Abcd1234' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '+923XXXXXXXXX' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+92\d{10}$/, {
    message: 'Phone number must be in +923XXXXXXXXX format',
  })
  phoneNo: string;
}
