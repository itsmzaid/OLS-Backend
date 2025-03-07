import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'Wash' }) // Example service name
  @IsNotEmpty()
  @IsString()
  serviceName: string; // ✅ Now user will provide service name too

  @ApiProperty({ example: 'Hoodie' }) // Example item name
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 200 }) // Example price
  @IsNotEmpty()
  @IsNumber()
  price: number;
}
