import { Helmet } from "react-helmet-async";
import { Link, useNavigate, Navigate, useSearchParams } from "react-router";
import { Package, MapPin, Heart, LogOut, ChevronRight, ArrowLeft, Trash2, ShoppingCart } from "lucide-react";
import { ProfileCard } from "../components/profile/ProfileCard";
import { useAuthStore } from "../store/authStore";
import { useWishlistStore } from "../store/wishlistStore";
import { useCartStore } from "../store/cartStore";
import { useGetProducts } from "../hooks/useData";
import { toast } from "sonner";

export function Profile() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab");

  const wishlist = useWishlistStore((state) => state.wishlist);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const addToCart = useCartStore((state) => state.addToCart);

  const { data: products, isLoading: productsLoading } = useGetProducts();

  const handleLogout = () => {
    logout();
    useCartStore.getState().clearCart();
    navigate("/");
  };


  if (!isAuthenticated) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-20 text-center font-poppins">
        <h2 className="font-bold text-2xl mb-4">You are not logged in</h2>
        <p className="text-muted-foreground mb-6 text-sm">Log in to your account to view your profile, orders, and wishlist.</p>
        <div className="flex justify-center gap-4">
          <Link to="/login" className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors">Login</Link>
          <Link to="/register" className="border border-border px-6 py-2.5 rounded-xl font-semibold hover:bg-muted transition-colors text-foreground">Register</Link>
        </div>
      </div>
    );
  }

  if (currentTab === "wishlist") {
    const wishlistedProducts = products?.filter((p: any) => wishlist.includes(p._id)) || [];

    const handleMoveToCart = (product: any) => {
      addToCart(product);
      toggleWishlist(product._id);
      toast.success("Moved item to cart");
    };

    return (
      <>
        <Helmet>
          <title>My Wishlist | HBGO</title>
        </Helmet>
        <div className="max-w-[800px] mx-auto px-4 py-8 font-poppins">
          <button
            onClick={() => setSearchParams({})}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>

          <h1 className="font-bold text-2xl text-foreground mb-6 flex items-center gap-2">
            <Heart className="fill-rose-500 text-rose-500" size={24} />
            My Wishlist ({wishlist.length})
          </h1>

          {productsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-card border border-border rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : wishlistedProducts.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl shadow-sm flex flex-col items-center">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4 text-rose-500">
                <Heart size={32} />
              </div>
              <p className="text-foreground font-semibold text-lg mb-1">Your Wishlist is Empty</p>
              <p className="text-muted-foreground mb-6 text-sm max-w-sm">Tap the heart icon on any products you like to save them here for later.</p>
              <Link to="/" className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
                Explore Mobiles
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistedProducts.map((product: any) => {
                const inStock = product.stock == null ? true : product.stock > 0;
                const image = product.images?.[0] || "/placeholder.png";

                return (
                  <div key={product._id} className="bg-card border border-border rounded-2xl p-4 flex gap-4 items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-muted rounded-xl overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={image}
                        alt={product.title}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm sm:text-base line-clamp-1">{product.title}</p>
                      {product.brand && <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">{product.brand}</p>}
                      <p className="font-bold text-primary text-base sm:text-lg mt-1">₹{product.price.toLocaleString()}</p>
                      
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <button
                          onClick={() => handleMoveToCart(product)}
                          disabled={!inStock}
                          className="flex items-center gap-1.5 bg-[#E1ECEE] text-[#0A2E36] hover:bg-[#C8DDE1] disabled:opacity-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ShoppingCart size={13} />
                          Move to Cart
                        </button>
                        <button
                          onClick={() => {
                            toggleWishlist(product._id);
                          }}
                          className="flex items-center gap-1 text-xs text-destructive hover:underline font-medium"
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="hidden sm:block text-right flex-shrink-0">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        inStock ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-destructive bg-destructive/10 border-destructive/20"
                      }`}>
                        {inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Profile | HBGO</title>
      </Helmet>
      <div className="max-w-[800px] mx-auto px-4 py-8 font-poppins">
        <h1 className="font-bold text-2xl text-foreground mb-6">My Profile</h1>
        
        <div className="mb-6">
          <ProfileCard user={user} />
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <Link to="/orders" className="flex items-center justify-between p-4 hover:bg-muted transition-colors border-b border-border">
            <div className="flex items-center gap-3">
              <div className="bg-[#E3F7FB] p-2 rounded-lg text-primary"><Package size={20} /></div>
              <span className="font-medium text-foreground">My Orders</span>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </Link>
          <button 
            onClick={() => setSearchParams({ tab: "wishlist" })}
            className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-b border-border"
          >
            <div className="flex items-center gap-3">
              <div className="bg-rose-50 p-2 rounded-lg text-rose-500"><Heart size={20} /></div>
              <span className="font-medium text-foreground">Wishlist</span>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
          <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors"><LogOut size={20} /></div>
              <span className="font-medium text-red-500">Logout</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
