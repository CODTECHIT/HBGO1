import { Helmet } from "react-helmet-async";
import { OrderCard } from "../components/orders/OrderCard";
import { Link } from "react-router";
import { useGetMyOrders } from "../hooks/useData";
import { useAuthStore } from "../store/authStore";

function OrderSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-4 w-32 bg-muted rounded-full" />
        <div className="h-5 w-20 bg-muted rounded-full" />
      </div>
      <div className="h-4 w-48 bg-muted rounded-full" />
      <div className="h-4 w-24 bg-muted rounded-full" />
    </div>
  );
}

export function Orders() {
  const { isAuthenticated } = useAuthStore();
  const { data: orders, isLoading } = useGetMyOrders();

  return (
    <>
      <Helmet>
        <title>My Orders | HBGO</title>
      </Helmet>
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="font-poppins font-bold text-2xl text-foreground mb-6">My Orders</h1>

        {!isAuthenticated ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-sm">
            <p className="text-muted-foreground mb-4">Please log in to view your orders.</p>
            <Link to="/login" className="inline-block bg-primary text-white font-semibold px-6 py-2.5 rounded-full hover:bg-primary/90 transition-colors">
              Login
            </Link>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-sm">
            <p className="text-muted-foreground mb-4">You have no orders yet.</p>
            <Link to="/" className="inline-block bg-primary text-white font-semibold px-6 py-2.5 rounded-full hover:bg-primary/90 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order: any) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
