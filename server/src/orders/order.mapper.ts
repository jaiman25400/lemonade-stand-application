import { OrderResponseDto } from './dto/order-response.dto';
import { Order } from './order.entity';

export function toOrderResponse(order: Order): OrderResponseDto {
  return {
    confirmationNumber: order.confirmationNumber,
    customerName: order.customerName,
    phone: order.customerPhone,
    email: order.customerEmail,
    items: (order.items ?? []).map((item) => ({
      beverageName: item.beverageName,
      sizeName: item.sizeName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
    total: Number(order.total),
    createdAt: order.createdAt,
  };
}
