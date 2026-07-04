import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartService } from "../services/cartService";
import { useAuthStore } from "./authStore";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

type CartState = {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: { _id?: string; id?: string; title?: string; name?: string; price: number; images?: string[]; image?: string; stock?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  mergeLocalCart: () => Promise<void>;
  toast: boolean;
  setToast: (val: boolean) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      cartCount: 0,
      toast: false,
      setToast: (val) => set({ toast: val }),

      addToCart: (product) => {
        const id = String(product._id || product.id);
        const name = product.title || product.name || "Product";
        const image = product.images?.[0] || product.image || "/placeholder.png";
        const price = product.price;
        const stock = product.stock == null ? 99 : Number(product.stock);

        const state = get();
        const existing = state.cartItems.find((item) => item.id === id);

        if (existing) {
          if (existing.quantity + 1 > stock) {
            import("sonner").then(({ toast }) => toast.error(`Cannot add more. Only ${stock} items available in stock.`));
            return;
          }
          const nextItems = state.cartItems.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          );
          
          set({
            cartItems: nextItems,
            cartCount: state.cartCount + 1,
            toast: true,
          });

          if (useAuthStore.getState().isAuthenticated) {
            cartService.updateCartItem(id, { quantity: existing.quantity + 1 }).catch(err => {
              console.error("Failed to sync quantity update", err);
            });
          }
          return;
        }

        if (stock < 1) {
          import("sonner").then(({ toast }) => toast.error("Product is out of stock."));
          return;
        }

        const newItem = { id, name, price, image, quantity: 1, stock };
        set({
          cartItems: [...state.cartItems, newItem],
          cartCount: state.cartCount + 1,
          toast: true,
        });

        if (useAuthStore.getState().isAuthenticated) {
          cartService.addToCart({ productId: id, quantity: 1 }).catch(err => {
            console.error("Failed to sync add to cart", err);
          });
        }
      },

      removeFromCart: (id) => {
        const state = get();
        const existing = state.cartItems.find((item) => item.id === id);
        if (!existing) return;

        set({
          cartItems: state.cartItems.filter((item) => item.id !== id),
          cartCount: state.cartCount - existing.quantity,
        });

        if (useAuthStore.getState().isAuthenticated) {
          cartService.removeFromCart(id).catch(err => {
            console.error("Failed to sync remove from cart", err);
          });
        }
      },

      updateQuantity: (id, quantity) => {
        const state = get();
        const existing = state.cartItems.find((item) => item.id === id);
        if (!existing) return;

        if (quantity <= 0) {
          set({
            cartItems: state.cartItems.filter((item) => item.id !== id),
            cartCount: state.cartCount - existing.quantity,
          });

          if (useAuthStore.getState().isAuthenticated) {
            cartService.removeFromCart(id).catch(err => {
              console.error("Failed to sync remove from cart", err);
            });
          }
          return;
        }

        const stock = existing.stock;
        let targetQuantity = quantity;
        if (quantity > stock) {
          import("sonner").then(({ toast }) => toast.warning(`Capped at available stock: ${stock} items.`));
          targetQuantity = stock;
        }

        const diff = targetQuantity - existing.quantity;
        if (diff === 0) return;

        set({
          cartItems: state.cartItems.map((item) =>
            item.id === id ? { ...item, quantity: targetQuantity } : item
          ),
          cartCount: state.cartCount + diff,
        });

        if (useAuthStore.getState().isAuthenticated) {
          cartService.updateCartItem(id, { quantity: targetQuantity }).catch(err => {
            console.error("Failed to sync quantity update", err);
          });
        }
      },

      clearCart: () => {
        set({ cartItems: [], cartCount: 0 });
        if (useAuthStore.getState().isAuthenticated) {
          apiCartClearHelper();
        }
      },

      syncCart: async () => {
        try {
          const dbCartItems = await cartService.getCart();
          // Filter out items where the product has been deleted from database
          const validCartItems = (dbCartItems || []).filter((item: any) => item.productId !== null);
          
          const cartItems: CartItem[] = validCartItems.map((item: any) => {
            const prod = item.productId || {};
            return {
              id: prod._id || item.productId,
              name: prod.title || "Product",
              price: prod.price || 0,
              image: prod.images?.[0] || "/placeholder.png",
              quantity: item.quantity,
              stock: prod.stock || 0
            };
          });
          const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
          set({ cartItems, cartCount });
        } catch (error) {
          console.error("Failed to sync cart with backend", error);
        }
      },

      mergeLocalCart: async () => {
        const { cartItems } = get();
        if (cartItems.length === 0) {
          await get().syncCart();
          return;
        }
        for (const item of cartItems) {
          try {
            await cartService.addToCart({ productId: item.id, quantity: item.quantity });
          } catch (err) {
            console.error(`Failed to merge item ${item.id}`, err);
          }
        }
        await get().syncCart();
      }
    }),
    { name: "hbgo-cart" }
  )
);

// Helper to avoid circular dependency / top level import of API in clearCart
async function apiCartClearHelper() {
  try {
    await cartService.getCart().then(async () => {
      // Just make a delete request to clear it
      const { api } = await import("../api/axios");
      await api.delete("/cart");
    });
  } catch (e) {
    console.error("Clear backend cart failed", e);
  }
}
