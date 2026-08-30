import { createOrder } from "@/src/api/orders";
import { useMutation } from "@tanstack/react-query";

export function useCreateOrderMutation() {
  return useMutation({
    mutationFn: createOrder,
  });
}
