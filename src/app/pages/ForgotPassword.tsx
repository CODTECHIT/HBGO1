import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { useState } from "react";
import { authService } from "../services/authService";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, Mail, ArrowLeft } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccess(true);
        toast.success("Password reset email sent!");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to send reset link. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password | HBGO</title>
      </Helmet>
      <div className="max-w-[500px] mx-auto px-4 py-20 font-poppins">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <Link to="/login" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft size={14} /> Back to Login
          </Link>

          <h1 className="font-bold text-2xl text-foreground mb-2 text-center">
            Reset Password
          </h1>
          <p className="text-muted-foreground text-sm text-center mb-6">
            Enter your email address and we'll send you a secure link to reset your password.
          </p>

          {success ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <CheckCircle size={28} />
              </div>
              <p className="text-foreground font-semibold text-lg">Check Your Email</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>. Please check your inbox and spam folders.
              </p>
              <button
                onClick={() => { setSuccess(false); setEmail(""); }}
                className="text-primary font-semibold text-sm hover:underline mt-2 block mx-auto"
              >
                Send link again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-4 py-3">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    required
                    className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-background text-foreground ${
                      error ? "border-destructive focus:ring-destructive/20" : "border-border focus:ring-primary"
                    }`}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all mt-2 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending link...
                  </>
                ) : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
