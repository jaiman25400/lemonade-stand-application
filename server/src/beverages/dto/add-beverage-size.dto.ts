import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class AddBeverageSizeDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  sizeId!: string;

  @ApiProperty({ example: 2.0, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999.99)
  price!: number;
}
