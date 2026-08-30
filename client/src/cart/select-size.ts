import type { Beverage, BeverageSize } from "@/src/types/api";

/**
 * A refetch can drop the size the customer had selected. Fall back to one that
 * is still on the menu so Add never points at a size the API no longer offers.
 */
export function resolveSelectedSize(
  sizes: Beverage["sizes"],
  sizeId: string | undefined,
): BeverageSize | undefined {
  return sizes.find((size) => size.id === sizeId) ?? sizes[0];
}
