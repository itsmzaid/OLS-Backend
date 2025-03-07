import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'ABC' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
