import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { api } from "../api/axios";
import { Helmet } from "react-helmet-async";
import { CheckCircle, XCircle } from "lucide-react";

export function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const navigate = useNavigate();
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Failed to verify email. The link may have expired or is invalid.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <>
      <Helmet>
        <title>Verify Email | HBGO</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background p-4 font-poppins">
        <div className="bg-card border border-border rounded-2xl shadow-sm max-w-md w-full p-8 text-center space-y-6">
          
          <div className="flex justify-center">
            {status === "loading" && (
              <svg className="animate-spin h-16 w-16 text-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {status === "success" && (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {status === "loading" && "Verifying Email"}
              {status === "success" && "Email Verified!"}
              {status === "error" && "Verification Failed"}
            </h1>
            <p className="text-muted-foreground">{message}</p>
          </div>

          {status !== "loading" && (
            <div className="pt-4">
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Go to Login
              </button>
              {status === "error" && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Need help? <Link to="/contact" className="text-primary hover:underline">Contact Support</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
