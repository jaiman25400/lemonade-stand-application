import { SizeResponseDto } from './dto/size-response.dto';
import { Size } from './size.entity';

export function toSizeResponse(size: Size): SizeResponseDto {
  return {
    id: size.id,
    name: size.name,
  };
}
