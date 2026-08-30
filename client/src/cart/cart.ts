export type CartItem = {
  beverageId: string;
  beverageName: string;
  sizeId: string;
  sizeName: string;
  unitPrice: number;
  quantity: number;
};

const MAX_QUANTITY = 99;

function isSameLine(
  item: CartItem,
  beverageId: string,
  sizeId: string,
): boolean {
  return item.beverageId === beverageId && item.sizeId === sizeId;
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function addCartItem(
  items: CartItem[],
  incoming: CartItem,
): CartItem[] {
  const index = items.findIndex((item) =>
    isSameLine(item, incoming.beverageId, incoming.sizeId),
  );

  if (index === -1) {
    return [...items, incoming];
  }

  return items.map((item, i) =>
    i === index
      ? {
          ...item,
          quantity: Math.min(MAX_QUANTITY, item.quantity + incoming.quantity),
        }
      : item,
  );
}

export function setCartItemQuantity(
  items: CartItem[],
  beverageId: string,
  sizeId: string,
  quantity: number,
): CartItem[] {
  if (quantity < 1) {
    return removeCartItem(items, beverageId, sizeId);
  }

  return items.map((item) =>
    isSameLine(item, beverageId, sizeId)
      ? { ...item, quantity: Math.min(MAX_QUANTITY, quantity) }
      : item,
  );
}

export function removeCartItem(
  items: CartItem[],
  beverageId: string,
  sizeId: string,
): CartItem[] {
  return items.filter((item) => !isSameLine(item, beverageId, sizeId));
}

export function cartLineTotal(item: CartItem): number {
  return item.unitPrice * item.quantity;
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + cartLineTotal(item), 0);
}
