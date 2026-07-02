import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";
import { toast } from "sonner";
import { ShieldAlert, AlertCircle, Eye, EyeOff } from "lucide-react";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authService.login({ email, password });

      if (response.success) {
        if (response.data.role !== "admin") {
          setError("Access denied. You do not have admin privileges.");
          return;
        }

        login(response.data, "token-stored-in-cookie");
        toast.success("Welcome back, Admin!");
        navigate("/admin/HBGO");
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
        <title>Admin Login | SKML Mobiles</title>
      </Helmet>
      <div className="min-h-screen bg-muted/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <ShieldAlert size={48} className="text-primary" />
            </div>
          </div>
          <h2 className="mt-2 text-center text-3xl font-poppins font-bold tracking-tight text-foreground">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Secure access for authorized personnel only
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card py-8 px-4 shadow-sm border border-border sm:rounded-2xl sm:px-10">
            <form className="space-y-5" onSubmit={handleLogin}>

              {/* Inline error banner */}
              {error && (
                <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-4 py-3">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className={`block w-full rounded-xl border px-4 py-3 placeholder-muted-foreground focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                    error ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"
                  }`}
                  placeholder="admin@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className={`block w-full rounded-xl border px-4 py-3 pr-12 placeholder-muted-foreground focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                      error ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"
                    }`}
                    placeholder="••••••••"
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
                className="flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Authenticating...
                  </span>
                ) : "Sign in to Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
