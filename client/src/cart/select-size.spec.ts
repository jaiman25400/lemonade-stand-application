import { resolveSelectedSize } from "@/src/cart/select-size";
import type { BeverageSize } from "@/src/types/api";

const small: BeverageSize = { id: "size-s", name: "Small", price: 2 };
const large: BeverageSize = { id: "size-l", name: "Large", price: 3.5 };

describe("resolveSelectedSize", () => {
  it("keeps the size the customer picked", () => {
    expect(resolveSelectedSize([small, large], "size-l")).toBe(large);
  });

  it("falls back to a live size when the picked one leaves the catalog", () => {
    const medium: BeverageSize = { id: "size-m", name: "Medium", price: 3 };

    expect(resolveSelectedSize([medium], "size-l")).toBe(medium);
  });

  it("defaults to the first size before the customer picks one", () => {
    expect(resolveSelectedSize([small, large], undefined)).toBe(small);
  });

  it("has no size to add when the drink has none", () => {
    expect(resolveSelectedSize([], "size-l")).toBeUndefined();
  });
});
