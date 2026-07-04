import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router";
import { TrackingTimeline } from "../components/tracking/TrackingTimeline";
import { ChevronLeft, ExternalLink, Loader2 } from "lucide-react";
import { useOrder } from "../hooks/useOrders";

export function Tracking() {
  const { trackingId } = useParams();
  const { data: orderResponse, isLoading, error } = useOrder(trackingId || "");
  const order = orderResponse?.data;

  // Calculate estimated delivery (3 days from order date if not shipped, else 1 day)
  const getEstimatedDelivery = () => {
    if (!order) return "Pending";
    const orderDate = new Date(order.createdAt);
    const daysToAdd = order.orderStatus === "Shipped" || order.orderStatus === "Delivered" ? 1 : 3;
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
    return estimatedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-16 text-center">
        <p className="text-destructive font-medium">Order not found</p>
        <Link to="/orders" className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-4">
          <ChevronLeft size={16} className="mr-1" /> Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Track Order {trackingId} | HBGO</title>
      </Helmet>
      <div className="max-w-[800px] mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/orders" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4">
            <ChevronLeft size={16} className="mr-1" /> Back to Orders
          </Link>
          <h1 className="font-poppins font-bold text-2xl text-foreground">Track Order</h1>
          <p className="text-muted-foreground text-sm mt-1">Order ID: {trackingId}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-border pb-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Estimated Delivery</p>
              <p className="font-bold text-foreground">{getEstimatedDelivery()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Order Status</p>
              <p className="font-bold text-foreground">{order.orderStatus}</p>
            </div>
          </div>

          {order.trackingId && (
            <div className="mb-8 bg-muted/30 rounded-xl p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Tracking ID</p>
                  <p className="font-bold text-foreground">{order.trackingId}</p>
                </div>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
                  >
                    Track on Courier Site <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          )}

          <TrackingTimeline currentStatus={order.orderStatus} />
        </div>
      </div>
    </>
  );
}
