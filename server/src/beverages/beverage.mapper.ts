import { Beverage } from './beverage.entity';
import { BeverageResponseDto } from './dto/beverage-response.dto';

export function toBeverageResponse(beverage: Beverage): BeverageResponseDto {
  const sizes = [...(beverage.beverageSizes ?? [])]
    .filter((row) => row.size)
    .map((row) => ({
      id: row.size.id,
      name: row.size.name,
      price: Number(row.price),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    id: beverage.id,
    name: beverage.name,
    sizes,
    createdAt: beverage.createdAt,
    updatedAt: beverage.updatedAt,
  };
}
