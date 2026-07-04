import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useCartStore } from "../store/cartStore";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";
import { toast } from "sonner";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
    setLoading(true);
    try {
      const response = await authService.register({ name, email, phone, password });
      
      if (response.success) {
        // Automatically log them in
        login(response.data, "token-stored-in-cookie");
        toast.success("Registered successfully!");

        // Merge guest cart to member account
        try {
          await useCartStore.getState().mergeLocalCart();
        } catch (err) {
          console.error("Cart merge on registration failed", err);
        }

        navigate(redirect);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register | HBGO</title>
      </Helmet>
      <div className="max-w-[500px] mx-auto px-4 py-12">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <h1 className="font-poppins font-bold text-2xl text-foreground mb-6 text-center">Create an Account</h1>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" 
                placeholder="Enter your full name" 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" 
                placeholder="Enter your email" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" 
                placeholder="Enter your phone number" 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" 
                placeholder="Create a password" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" 
                placeholder="Confirm your password" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Login here</Link>
          </p>
        </div>
      </div>
    </>
  );
}
