import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { wishlistService } from "../services/wishlistService";
import { Link } from "react-router";
import { ProductCard } from "../components/product/ProductCard";
import { useAuthStore } from "../store/authStore";

export function Wishlist() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const fetchWishlist = async () => {
      try {
        const response = await wishlistService.getWishlist();
        setWishlist(response.data);
      } catch (error) {
        console.error("Failed to load wishlist", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center font-poppins">
        <h2 className="text-2xl font-bold mb-4">Please log in to view your wishlist.</h2>
        <Link to="/login?redirect=wishlist" className="bg-primary text-white px-6 py-2 rounded-xl">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Wishlist | HBGO</title>
      </Helmet>
      <div className="max-w-[1400px] mx-auto px-4 py-8 font-poppins min-h-[60vh]">
        <h1 className="text-2xl font-bold text-foreground mb-8">My Wishlist</h1>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-sm">
            <p className="text-muted-foreground text-lg mb-6">Your wishlist is empty.</p>
            <Link to="/" className="bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
