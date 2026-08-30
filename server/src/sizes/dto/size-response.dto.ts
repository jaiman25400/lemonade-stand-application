import { ApiProperty } from '@nestjs/swagger';

export class SizeResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Small' })
  name!: string;
}
