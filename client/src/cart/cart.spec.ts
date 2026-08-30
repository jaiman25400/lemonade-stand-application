import {
  addCartItem,
  cartItemCount,
  cartLineTotal,
  cartTotal,
  removeCartItem,
  setCartItemQuantity,
  type CartItem,
} from "@/src/cart/cart";

const lemonade: CartItem = {
  beverageId: "bev-1",
  beverageName: "Classic Lemonade",
  sizeId: "size-s",
  sizeName: "Small",
  unitPrice: 2,
  quantity: 1,
};

const large: CartItem = {
  ...lemonade,
  sizeId: "size-l",
  sizeName: "Large",
  unitPrice: 3.5,
};

describe("cart", () => {
  it("merges the same drink and size into one line", () => {
    const items = addCartItem(
      addCartItem([], { ...lemonade, quantity: 1 }),
      { ...lemonade, quantity: 2 },
    );

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
    expect(cartItemCount(items)).toBe(3);
  });

  it("keeps different sizes as separate lines", () => {
    const items = addCartItem(addCartItem([], lemonade), large);

    expect(items).toHaveLength(2);
    expect(cartItemCount(items)).toBe(2);
  });

  it("caps quantity at 99", () => {
    const items = addCartItem([], { ...lemonade, quantity: 90 });
    const next = addCartItem(items, { ...lemonade, quantity: 20 });

    expect(next[0].quantity).toBe(99);
  });

  it("removes a line when quantity is set below 1", () => {
    const items = setCartItemQuantity([lemonade], "bev-1", "size-s", 0);

    expect(items).toHaveLength(0);
  });

  it("removes a line by beverage and size", () => {
    const items = removeCartItem([lemonade, large], "bev-1", "size-s");

    expect(items).toEqual([large]);
  });

  it("calculates live line and cart totals from unit price", () => {
    const two = { ...lemonade, quantity: 2 };
    const oneLarge = { ...large, quantity: 1 };
    const items = [two, oneLarge];

    expect(cartLineTotal(two)).toBe(4);
    expect(cartTotal(items)).toBe(7.5);
  });
});
