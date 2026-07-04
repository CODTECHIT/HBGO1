import { create } from "zustand";
import { persist } from "zustand/middleware";
import { wishlistService } from "../services/wishlistService";
import { useAuthStore } from "./authStore";
import { toast } from "sonner";

type WishlistState = {
  wishlist: string[];
  setWishlist: (wishlist: string[]) => void;
  toggleWishlist: (id: string) => Promise<void>;
  syncWishlist: () => Promise<void>;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      setWishlist: (wishlist) => set({ wishlist }),
      syncWishlist: async () => {
        try {
          const response = await wishlistService.getWishlist();
          // Map array of objects to array of IDs if necessary, or assume the backend returns IDs
          // Wait, the backend returns `user.wishlist`. In Mongoose, if we don't populate, it's ObjectIds.
          // In wishlistController `getWishlist`, we did `.populate("wishlist")`.
          // We should just map it to `_id`
          const ids = response.data.map((item: any) => typeof item === 'string' ? item : item._id);
          set({ wishlist: ids });
        } catch (error) {
          console.error("Failed to sync wishlist", error);
        }
      },
      toggleWishlist: async (id) => {
        const { isAuthenticated } = useAuthStore.getState();
        const state = get();
        
        // Optimistic UI update
        const exists = state.wishlist.includes(id);
        const newWishlist = exists 
          ? state.wishlist.filter((item) => item !== id)
          : [...state.wishlist, id];
        
        set({ wishlist: newWishlist });
        
        if (isAuthenticated) {
          try {
            await wishlistService.toggleWishlist(id);
            toast.success(exists ? "Removed from wishlist" : "Added to wishlist");
          } catch (error) {
            // Revert on failure
            set({ wishlist: state.wishlist });
            toast.error("Failed to update wishlist");
          }
        } else {
          toast.success(exists ? "Removed from wishlist" : "Added to wishlist");
        }
      },
    }),
    { name: "hbgo-wishlist" }
  )
);
