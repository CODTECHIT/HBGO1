import { Helmet } from "react-helmet-async";
import { useNavigate, Navigate } from "react-router";
import { useState, useEffect } from "react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { AddressForm, AddressData } from "../components/checkout/AddressForm";
import { OrderSummary } from "../components/checkout/OrderSummary";
import { orderService } from "../services/orderService";
import { toast } from "sonner";
import { useGetSettings } from "../hooks/useData";

export function Checkout() {
  const { data: settings } = useGetSettings();
  const cartItems = useCartStore((state) => state.cartItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<AddressData>({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddressData, string>>>({});

  const [idempotencyKey] = useState(() => crypto.randomUUID());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen flex items-center justify-center text-primary">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=checkout" replace />;
  }

  const handleAddressChange = (field: keyof AddressData, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressData, string>> = {};
    
    if (!address.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (!/^[a-zA-Z\s]{3,50}$/.test(address.fullName.trim())) {
      newErrors.fullName = "Enter a valid name (3-50 chars, letters only).";
    }

    if (!address.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit Indian phone number.";
    }

    if (!address.street.trim()) {
      newErrors.street = "Street address is required.";
    } else if (address.street.trim().length < 5) {
      newErrors.street = "Address must be at least 5 characters.";
    }

    if (!address.city.trim()) {
      newErrors.city = "City is required.";
    } else if (!/^[a-zA-Z\s]{2,30}$/.test(address.city.trim())) {
      newErrors.city = "Enter a valid city name (letters only).";
    }

    if (!address.state.trim()) {
      newErrors.state = "State is required.";
    } else if (!/^[a-zA-Z\s]{2,30}$/.test(address.state.trim())) {
      newErrors.state = "Enter a valid state name (letters only).";
    }

    if (!address.zipCode.trim()) {
      newErrors.zipCode = "Pincode is required.";
    } else if (!/^\d{6}$/.test(address.zipCode.trim())) {
      newErrors.zipCode = "Enter a valid 6-digit pincode.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  const deliveryCharge = subtotal > 0 ? (settings?.shippingCharge ?? 50) : 0;
  const total = subtotal + deliveryCharge;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error("Please resolve all errors in the shipping address.");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        products: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total,
        paymentMethod: paymentMethod === "cod" ? "COD" : "Online",
        address: {
          fullName: address.fullName,
          phone: address.phone,
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
        },
      };

      // 1. Create order on database (will be paymentStatus: "Pending")
      const res = await orderService.createOrder(orderData, idempotencyKey);
      if (!res.success) {
        toast.error("Failed to initiate order.");
        setLoading(false);
        return;
      }

      const dbOrderId = res.data._id;

      if (paymentMethod === "online") {
        // 2. Call backend payments endpoint to create a Razorpay order
        const { api } = await import("../api/axios");
        const payRes = await api.post("/payments/create-order", { orderId: dbOrderId });

        if (payRes.data.success && payRes.data.data.fallback) {
          // If Razorpay keys are not set up on backend, fallback to COD order automatically
          toast.success("Order placed successfully (COD Fallback Mode)!");
          clearCart();
          navigate("/orders");
          return;
        }

        const razorpayOrder = payRes.data.data;
        const key_id = razorpayOrder.key_id;

        // 3. Load the Razorpay Checkout SDK script
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast.error("Failed to load Razorpay Payment Gateway. Check your internet connection.");
          setLoading(false);
          return;
        }

        // 4. Configure Razorpay checkout overlay options
        const options = {
          key: key_id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "HBGO",
          description: "Smartphone Order Payment",
          order_id: razorpayOrder.id,
          handler: async (response: any) => {
            setLoading(true);
            try {
              // 5. Submit response signature to verification endpoint
              const verifyRes = await api.post("/payments/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: dbOrderId,
              });

              if (verifyRes.data.success) {
                clearCart();
                toast.success("Payment verified and order placed successfully!");
                navigate("/orders");
              }
            } catch (verifyErr: any) {
              toast.error(verifyErr.response?.data?.message || "Payment signature verification failed.");
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: address.fullName,
            contact: address.phone,
            email: useAuthStore.getState().user?.email || "",
          },
          theme: {
            color: "#0E7C8C",
          },
          modal: {
            ondismiss: () => {
              toast.error("Payment modal closed by user.");
              setLoading(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // COD order flow completed directly
        clearCart();
        toast.success("Order placed successfully!");
        navigate("/orders");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to place order.");
    } finally {
      if (paymentMethod !== "online") {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout | HBGO</title>
      </Helmet>
      <div className="max-w-[1400px] mx-auto px-4 py-8 font-poppins">
        <h1 className="font-bold text-2xl text-foreground mb-6">Checkout</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl shadow-sm flex flex-col items-center">
            <p className="text-muted-foreground mb-4 text-lg font-medium">Your cart is empty</p>
            <button onClick={() => navigate("/")} className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
              Go to Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <AddressForm address={address} onChange={handleAddressChange} errors={errors} />
              </div>
              
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-foreground text-lg mb-2">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="font-medium text-foreground">Cash on Delivery (COD)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="font-medium text-foreground">Online Payment (Razorpay)</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="lg:w-[380px]">
              <OrderSummary subtotal={subtotal} deliveryCharge={deliveryCharge} />
              <button 
                onClick={handlePlaceOrder}
                disabled={loading || cartItems.length === 0}
                className="mt-4 w-full flex justify-center bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Placing Order...
                  </>
                ) : "Place Order"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
