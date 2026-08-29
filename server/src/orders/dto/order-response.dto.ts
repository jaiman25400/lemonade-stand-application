import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty()
  beverageName!: string;

  @ApiProperty()
  sizeName!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty({ example: 2 })
  unitPrice!: number;

  @ApiProperty({ example: 4 })
  lineTotal!: number;
}

export class OrderResponseDto {
  @ApiProperty({ example: 'LS-A1B2C3D4' })
  confirmationNumber!: string;

  @ApiProperty()
  customerName!: string;

  @ApiPropertyOptional()
  phone!: string | null;

  @ApiPropertyOptional()
  email!: string | null;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiProperty({ example: 6 })
  total!: number;

  @ApiProperty()
  createdAt!: Date;
}
