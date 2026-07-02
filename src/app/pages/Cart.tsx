import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { useCartStore } from "../store/cartStore";
import { ShoppingBag } from "lucide-react";
import { useGetSettings } from "../hooks/useData";

export function Cart() {
  const { data: settings } = useGetSettings();
  const { cartItems, cartCount, removeFromCart, updateQuantity } = useCartStore();

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  const deliveryCharge = subtotal > 0 ? (settings?.shippingCharge ?? 50) : 0;
  const total = subtotal + deliveryCharge;

  return (
    <>
      <Helmet>
        <title>Shopping Cart | SKML Mobiles</title>
      </Helmet>

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <h1 className="font-poppins font-bold text-xl sm:text-2xl text-foreground mb-5">
          Shopping Cart ({cartCount})
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={32} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4 text-lg font-medium">Your cart is empty</p>
            <Link to="/" className="inline-block bg-primary text-white font-semibold px-6 py-2.5 rounded-full hover:bg-primary/90 transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cart Items */}
            <div className="flex-1 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex gap-4 items-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-muted rounded-xl overflow-hidden">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm sm:text-base line-clamp-2 leading-snug">{item.name}</p>
                    <p className="font-bold text-primary text-base sm:text-lg mt-1">₹{(item.price || 0).toLocaleString()}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {/* Quantity control */}
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-muted transition-colors"
                        >−</button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-muted transition-colors"
                        >+</button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-destructive hover:underline font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-foreground hidden sm:block flex-shrink-0">
                    ₹{((item.price || 0) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-[360px] flex-shrink-0">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm sticky top-20">
                <h2 className="font-poppins font-bold text-lg text-foreground mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-semibold text-emerald-600">{deliveryCharge === 0 ? "Free" : `₹${deliveryCharge}`}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toLocaleString()}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="mt-5 w-full flex justify-center bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                  Proceed to Checkout
                </Link>
                <Link to="/" className="mt-3 w-full flex justify-center text-sm text-muted-foreground hover:text-primary transition-colors">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
