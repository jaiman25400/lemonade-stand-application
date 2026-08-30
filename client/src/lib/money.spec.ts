import { formatPrice } from "@/src/lib/money";

describe("formatPrice", () => {
  it("formats catalog prices with two decimal places", () => {
    expect(formatPrice(2)).toBe("$2.00");
    expect(formatPrice(3.5)).toBe("$3.50");
  });
});
