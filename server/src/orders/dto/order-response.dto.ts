import { ApiProperty } from '@nestjs/swagger';

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

  // `type` is explicit because Swagger cannot infer a `string | null` union
  // from emitted metadata and would otherwise publish these as `object`.
  @ApiProperty({ type: String, nullable: true, example: '+1 416 555 0100' })
  phone!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'ada@example.com' })
  email!: string | null;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiProperty({ example: 6 })
  total!: number;

  @ApiProperty()
  createdAt!: Date;
}
