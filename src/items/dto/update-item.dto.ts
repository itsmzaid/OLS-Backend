import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateItemDto {
  @ApiProperty({ example: 'Wash' }) // ✅ Allow updating serviceName
  @IsOptional()
  @IsString()
  serviceName?: string;

  @ApiProperty({ example: 'T-Shirt' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 250 })
  @IsOptional()
  @IsNumber()
  price?: number;
}
