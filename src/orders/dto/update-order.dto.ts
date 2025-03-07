import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  IsISO8601,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../order-status.enum';
import { OrderItemDto } from './order-item.dto';

export class UpdateOrderDto {
  @ApiProperty({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  pickupDate?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  pickupTime?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  deliveryCharges?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems?: OrderItemDto[];
}
