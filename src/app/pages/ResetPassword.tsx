import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link } from "react-router";
import { useState } from "react";
import { authService } from "../services/authService";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";

export function ResetPassword() {
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(resetToken || "", { password });
      if (response.success) {
        setSuccess(true);
        toast.success("Password reset successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to reset password. Link may be invalid or expired.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password | HBGO</title>
      </Helmet>
      <div className="max-w-[500px] mx-auto px-4 py-20 font-poppins">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <h1 className="font-bold text-2xl text-foreground mb-2 text-center">
            Set New Password
          </h1>
          <p className="text-muted-foreground text-sm text-center mb-6">
            Create a strong password that is at least 6 characters long.
          </p>

          {success ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <CheckCircle size={28} />
              </div>
              <p className="text-foreground font-semibold text-lg">Password Changed!</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your password has been successfully reset. You will be redirected to the login page shortly.
              </p>
              <Link to="/login" className="inline-block bg-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors mt-2">
                Log In Now
              </Link>
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
                <label className="text-sm font-medium text-foreground">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    required
                    className={`w-full px-4 py-2.5 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-background text-foreground ${
                      error ? "border-destructive focus:ring-destructive/20" : "border-border focus:ring-primary"
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  required
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-background text-foreground ${
                    error ? "border-destructive focus:ring-destructive/20" : "border-border focus:ring-primary"
                  }`}
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all mt-4 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Updating password...
                  </>
                ) : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
