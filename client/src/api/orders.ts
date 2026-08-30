import { ensureApiClient } from "@/src/api/configure-client";
import { toApiError } from "@/src/api/errors";
import { requestSignal } from "@/src/api/http";
import { ordersControllerCreate } from "@/src/gen/clients/orders/ordersControllerCreate";
import type { CreateOrderPayload, OrderResponse } from "@/src/types/api";

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<OrderResponse> {
  ensureApiClient();
  try {
    const result = await ordersControllerCreate({
      body: payload,
      signal: requestSignal(),
    });
    if (!result.data) {
      throw new Error("The server did not return an order confirmation");
    }
    return result.data;
  } catch (error) {
    throw toApiError(error);
  }
}
