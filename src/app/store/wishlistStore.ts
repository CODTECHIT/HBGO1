import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  wishlist: string[];
  addWishlist: (id: string) => void;
  removeWishlist: (id: string) => void;
  toggleWishlist: (id: string) => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      wishlist: [],
      addWishlist: (id) =>
        set((state) => {
          if (state.wishlist.includes(id)) return state;
          return { wishlist: [...state.wishlist, id] };
        }),
      removeWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.filter((item) => item !== id),
        })),
      toggleWishlist: (id) =>
        set((state) => {
          const exists = state.wishlist.includes(id);
          if (exists) {
            return { wishlist: state.wishlist.filter((item) => item !== id) };
          }
          return { wishlist: [...state.wishlist, id] };
        }),
    }),
    { name: "hbgo-wishlist" }
  )
);
