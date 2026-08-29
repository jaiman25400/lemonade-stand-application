import { ApiProperty } from '@nestjs/swagger';

export class BeverageSizeOfferingDto {
  @ApiProperty({ example: 'size-uuid' })
  id!: string;

  @ApiProperty({ example: 'Small' })
  name!: string;

  @ApiProperty({ example: 2.0 })
  price!: number;
}

export class BeverageResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Classic Lemonade' })
  name!: string;

  @ApiProperty({ type: [BeverageSizeOfferingDto] })
  sizes!: BeverageSizeOfferingDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
