import { api } from "../api/axios";

export const wishlistService = {
  getWishlist: async () => {
    const response = await api.get("/wishlist");
    return response.data;
  },
  toggleWishlist: async (productId: string) => {
    const response = await api.post(`/wishlist/${productId}`);
    return response.data;
  }
};
