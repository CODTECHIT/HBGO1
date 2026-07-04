import { Outlet, useLocation } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { useCartStore } from "../../store/cartStore";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useGetSettings } from "../../hooks/useData";

function Toast() {
  const toast = useCartStore((state) => state.toast);
  const setToast = useCartStore((state) => state.setToast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 bg-[#0E7C8C] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
        toast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      <CheckCircle size={15} />
      Item added to cart!
    </div>
  );
}

export function MainLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  
  const { isAuthenticated } = useAuthStore();
  const syncCart = useCartStore((state) => state.syncCart);
  const syncWishlist = useWishlistStore((state) => state.syncWishlist);

  useEffect(() => {
    if (isAuthenticated) {
      syncCart();
      syncWishlist();
    }
  }, [isAuthenticated, syncCart, syncWishlist]);

  const { data: settings } = useGetSettings();

  useEffect(() => {
    if (settings?.logoUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.logoUrl;
    }
  }, [settings?.logoUrl]);

  return (
    <div className="min-h-screen bg-background font-inter pb-16 md:pb-0 flex flex-col">
      <Toast />
      <Header />
      {/* Spacer to push content below the fixed header */}
      <div className="h-[80px] md:h-[112px] flex-shrink-0" />
      <main className="flex-1">
        <Outlet />
      </main>
      {isHome && <Footer />}
      <MobileNav />
    </div>
  );
}
