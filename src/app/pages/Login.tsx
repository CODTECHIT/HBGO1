import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useCartStore } from "../store/cartStore";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authService.login({ email, password });

      if (response.success) {
        if (response.data.role === "admin") {
          setError("Invalid email or password. Please try again.");
          setLoading(false);
          return;
        }

        login(response.data, "token-stored-in-cookie");
        toast.success("Logged in successfully");
        
        // Merge guest cart to member account
        try {
          await useCartStore.getState().mergeLocalCart();
        } catch (err) {
          console.error("Cart merge on login failed", err);
        }

        navigate(redirect);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Invalid email or password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | HBGO</title>
      </Helmet>
      <div className="max-w-[500px] mx-auto px-4 py-20">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <h1 className="font-poppins font-bold text-2xl text-foreground mb-6 text-center">
            Welcome Back
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Inline error banner */}
            {error && (
              <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-4 py-3">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  error ? "border-destructive focus:ring-destructive/20" : "border-border focus:ring-primary"
                }`}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
                  className={`w-full px-4 py-2.5 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    error ? "border-destructive focus:ring-destructive/20" : "border-border focus:ring-primary"
                  }`}
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all mt-2 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Logging in...
                </>
              ) : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
