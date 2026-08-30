import { ensureApiClient } from "@/src/api/configure-client";
import { readKubbError, requestSignal } from "@/src/api/http";
import { ordersControllerCreate } from "@/src/gen/clients/orders/ordersControllerCreate";
import type { OrderResponseDto } from "@/src/gen/types/OrderResponseDto";
import type { CreateOrderPayload, OrderResponse } from "@/src/types/api";

function toOrderResponse(dto: OrderResponseDto): OrderResponse {
  return {
    confirmationNumber: dto.confirmationNumber,
    customerName: dto.customerName,
    phone: typeof dto.phone === "string" ? dto.phone : null,
    email: typeof dto.email === "string" ? dto.email : null,
    items: dto.items,
    total: dto.total,
    createdAt: dto.createdAt,
  };
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<OrderResponse> {
  ensureApiClient();
  try {
    const result = await ordersControllerCreate({
      body: payload,
      signal: requestSignal(),
    });
    return toOrderResponse(result.data);
  } catch (error) {
    throw new Error(readKubbError(error));
  }
}
