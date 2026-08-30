export type { BeverageSizeOfferingDto as BeverageSize } from "@/src/gen/types/BeverageSizeOfferingDto";
export type { BeverageResponseDto as Beverage } from "@/src/gen/types/BeverageResponseDto";
export type { CreateOrderDto as CreateOrderPayload } from "@/src/gen/types/CreateOrderDto";
import type { OrderItemResponseDto } from "@/src/gen/types/OrderItemResponseDto";

/**
 * Nest marks nullable phone/email loosely in OpenAPI (`object`).
 * The screens use string | null, so we keep a mapped view of the DTO.
 */
export type OrderResponse = {
  confirmationNumber: string;
  customerName: string;
  phone: string | null;
  email: string | null;
  items: OrderItemResponseDto[];
  total: number;
  createdAt: string;
};
