import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';
import { AtLeastOneContactConstraint } from './at-least-one-contact.constraint.js';

function trimString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function emptyToUndefined({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

export class CreateOrderItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  beverageId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  sizeId!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Ada Lovelace' })
  @Validate(AtLeastOneContactConstraint)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  customerName!: string;

  @ApiPropertyOptional({ example: 'ada@example.com' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @ApiPropertyOptional({ example: '+1 416 555 0100' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @Matches(/^\+?[0-9()\-\s]{7,20}$/, {
    message: 'phone must be a valid phone number',
  })
  phone?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  items!: CreateOrderItemDto[];
}
