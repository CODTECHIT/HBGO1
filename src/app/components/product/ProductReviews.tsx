import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../api/axios";
import { toast } from "sonner";
import { StarRating } from "./StarRating";
import { User, MessageSquare } from "lucide-react";

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(`/products/${productId}/reviews`);
        setReviews(response.data.data);
      } catch (error) {
        console.error("Failed to load reviews", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please enter a review comment.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.post(`/products/${productId}/reviews`, { rating, comment });
      toast.success(response.data.message || "Review submitted!");
      // Prepend the new review assuming the backend populates userId
      const user = useAuthStore.getState().user;
      const newReview = {
        ...response.data.data,
        userId: { _id: user.id, name: user.name } // simulate populated user
      };
      setReviews([newReview, ...reviews]);
      setComment("");
      setRating(5);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm mt-8">
      <h2 className="font-poppins font-bold text-2xl text-foreground mb-6 flex items-center gap-2">
        <MessageSquare size={24} className="text-primary" />
        Customer Reviews
      </h2>

      {/* Write a Review Section */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-secondary/30 p-6 rounded-xl border border-border/50">
          <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-8 h-8 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">Your Feedback</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Tell us what you think about this product..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white font-bold py-2.5 px-6 rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <div className="mb-10 bg-secondary/30 p-6 rounded-xl border border-border/50 text-center">
          <p className="text-muted-foreground mb-3">You must be logged in to write a review.</p>
        </div>
      )}

      {/* Reviews List */}
      <div>
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-muted rounded-xl" />
            <div className="h-24 bg-muted rounded-xl" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground italic text-center py-8">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-border pb-6 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {review.userId?.name ? review.userId.name.charAt(0).toUpperCase() : <User size={16} />}
                    </div>
                    <span className="font-semibold text-foreground">{review.userId?.name || "Unknown User"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mb-2">
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
