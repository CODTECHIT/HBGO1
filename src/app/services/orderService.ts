import { api } from "../api/axios";

export const orderService = {
  getOrders: async () => {
    const response = await api.get("/orders");
    return response.data;
  },
  getOrderById: async (id: string | number) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  createOrder: async (orderData: any, idempotencyKey?: string) => {
    const config = idempotencyKey ? { headers: { "x-idempotency-key": idempotencyKey } } : {};
    const response = await api.post("/orders", orderData, config);
    return response.data;
  },
};
