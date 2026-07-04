export function OrderSummary({ subtotal, deliveryCharge }: { subtotal: number; deliveryCharge: number }) {
  const total = subtotal + deliveryCharge;
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="font-poppins font-bold text-foreground text-lg">Order Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal (Inclusive of Tax)</span>
          <span className="font-medium text-foreground">₹{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery Charge</span>
          <span className="font-medium text-foreground">₹{deliveryCharge}</span>
        </div>
      </div>
      <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground text-lg">
        <span>Total Amount</span>
        <span>₹{total.toLocaleString()}</span>
      </div>
    </div>
  );
}

