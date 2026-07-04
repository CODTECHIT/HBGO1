import { useParams, useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import { StarRating } from "../components/product/StarRating";
import { useGetProductById } from "../hooks/useData";

function ProductDetailSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col md:flex-row gap-8 animate-pulse">
        <div className="md:w-1/2 bg-muted rounded-xl h-80" />
        <div className="md:w-1/2 space-y-4">
          <div className="h-4 w-24 bg-muted rounded-full" />
          <div className="h-8 w-3/4 bg-muted rounded-xl" />
          <div className="h-4 w-40 bg-muted rounded-full" />
          <div className="h-10 w-32 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
          <div className="flex gap-3 mt-4">
            <div className="flex-1 h-12 bg-muted rounded-xl" />
            <div className="flex-1 h-12 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading, isError } = useGetProductById(id);
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const wishlist = useWishlistStore((state) => state.wishlist);

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="p-10 text-center font-poppins">
        <p className="text-foreground text-xl font-bold mb-4">Product not found</p>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mx-auto text-primary hover:underline">
          <ArrowLeft size={16} /> Go back
        </button>
      </div>
    );
  }

  const productId = product._id;
  const image = product.images?.[0] || "/placeholder.png";
  const name = product.title || product.name;
  const price = product.price || 0;
  const originalPrice = product.originalPrice || product.discountPrice;
  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;
  const inWishlist = wishlist.includes(productId);
  const inStock = product.stock == null ? true : product.stock > 0;

  return (
    <>
      <Helmet>
        <title>{name} | HBGO</title>
        <meta name="description" content={`Buy ${name} at the best price on HBGO.`} />
      </Helmet>

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col md:flex-row gap-8">
          {/* Image */}
          <div className="md:w-1/2 flex items-center justify-center bg-muted rounded-xl p-8 relative">
            <button
              onClick={() => toggleWishlist(productId)}
              className="absolute top-4 right-4 p-2.5 bg-background rounded-full shadow-sm hover:scale-110 active:scale-95 transition-transform"
            >
              <Heart size={20} className={inWishlist ? "fill-destructive text-destructive" : "text-muted-foreground"} />
            </button>
            <img src={image} alt={name}
              className="w-full max-w-sm object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
            />
          </div>

          {/* Info */}
          <div className="md:w-1/2 flex flex-col justify-center">
            {product.brand && (
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full w-fit mb-3">
                {product.brand}
              </span>
            )}
            <h1 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mb-2">{name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <StarRating rating={product.rating || 0} reviews={product.numReviews || 0} />
              <span className={`text-sm font-medium px-2 py-0.5 rounded border ${inStock ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-destructive bg-destructive/10 border-destructive/20'}`}>
                {inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="flex items-end gap-3 mb-6">
              <p className="font-poppins font-bold text-3xl text-foreground">₹{price.toLocaleString()}</p>
              {originalPrice && originalPrice > price && (
                <>
                  <p className="text-sm text-muted-foreground line-through mb-1">₹{originalPrice.toLocaleString()}</p>
                  {discount && <p className="text-sm font-bold text-green-600 mb-1">{discount}% OFF</p>}
                </>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">{product.description}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <button
                onClick={() => addToCart(product)}
                disabled={!inStock}
                className="flex-1 flex items-center justify-center gap-2 bg-[#E1ECEE] text-[#0A2E36] font-bold py-3.5 rounded-xl hover:bg-[#C8DDE1] transition-colors disabled:opacity-50"
              >
                <ShoppingCart size={20} /> Add to Cart
              </button>
              <button
                onClick={() => { addToCart(product); navigate("/checkout"); }}
                disabled={!inStock}
                className="flex-1 flex items-center justify-center gap-2 bg-[#FF7A00] text-white font-bold py-3.5 rounded-xl hover:bg-[#e06c00] transition-colors shadow-lg shadow-[#FF7A00]/20 disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
