import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsEmail,
  IsISO8601,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { OrderStatus } from '../order-status.enum';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  userEmail: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  userName: string;

  @ApiProperty({ example: '+923001234567' })
  @IsNotEmpty()
  @IsString()
  userPhoneNo: string;

  @ApiProperty({ example: '123 Main Street, City, Country' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.Pending })
  @IsEnum(OrderStatus)
  status: OrderStatus = OrderStatus.Pending;

  @ApiProperty({ example: '2025-03-10' })
  @IsNotEmpty()
  @IsISO8601()
  pickupDate: string;

  @ApiProperty({ example: '14:30' })
  @IsNotEmpty()
  @IsString()
  pickupTime: string;

  @ApiProperty({ example: 150 })
  @IsNotEmpty()
  @IsNumber()
  deliveryCharges: number;

  @ApiProperty({ example: 'Cash on Delivery' })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];
}
