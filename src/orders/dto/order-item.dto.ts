import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ example: 'item_123' })
  @IsNotEmpty()
  @IsString()
  itemId: string;

  @ApiProperty({ example: 'T-Shirt' })
  @IsNotEmpty()
  @IsString()
  itemName: string;

  @ApiProperty({ example: 'Wash' })
  @IsNotEmpty()
  @IsString()
  serviceName: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 500 })
  @IsNotEmpty()
  @IsNumber()
  price: number;
}
