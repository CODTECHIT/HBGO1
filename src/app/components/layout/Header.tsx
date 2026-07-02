import { useState, useEffect } from "react";
import { Search, Heart, ShoppingCart, User, Menu, X, MapPin, Loader2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router";
import { useWishlistStore } from "../../store/wishlistStore";
import { useCartStore } from "../../store/cartStore";
import { useLocationStore } from "../../store/locationStore";
import { useGetCategories, useGetSettings } from "../../hooks/useData";
import { useAuthStore } from "../../store/authStore";

export function Header() {
  const wishlist = useWishlistStore((state) => state.wishlist);
  const cartCount = useCartStore((state) => state.cartCount);
  const { location: userLocation, isLoading, requestLocation, error, clearError } = useLocationStore();
  const { data: categories } = useGetCategories();
  const { data: settings } = useGetSettings();
  const user = useAuthStore((state) => state.user);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Close mobile menu and search on route change
    setMobileMenuOpen(false);
    setShowMobileSearch(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
      setShowMobileSearch(false);
    }
  };

  const fallbackCategories = [
    { _id: "1", name: "Smartphones", slug: "smartphones" },
    { _id: "2", name: "Accessories", slug: "accessories" },
    { _id: "3", name: "Smartwatches", slug: "smartwatches" },
    { _id: "4", name: "Tablets", slug: "tablets" }
  ];

  const displayCategories = categories && categories.length > 0 ? categories : fallbackCategories;

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-card border-b border-border shadow-sm font-poppins">
      {/* Top Thin Announcement & Location Bar */}
      <div className="bg-[#0F172A] text-white text-[11px] border-b border-border/10 py-1.5 px-4 hidden md:block select-none">
        <div className="max-w-[1400px] mx-auto flex items-center justify-end">
          <div className="flex items-center gap-4">
            <button
              onClick={requestLocation}
              onMouseDown={() => clearError()}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-white/80 hover:text-white transition-colors"
            >
              {isLoading ? (
                <Loader2 size={11} className="animate-spin text-[#D4AF37]" />
              ) : (
                <MapPin size={11} className="text-[#D4AF37]" />
              )}
              <span>
                {userLocation || (error ? "Retry Location" : "Set Location")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-[1400px] mx-auto px-4 h-[80px] flex items-center justify-between gap-4">
        
        {/* DESKTOP VIEW */}
        {/* Desktop Logo */}
        <Link 
          to="/" 
          className="hidden md:flex items-center hover:opacity-80 transition-opacity select-none"
        >
          <img src={settings?.logoUrl || "/image.jpeg"} alt="HBGO Logo" className="h-14 w-auto object-contain rounded" />
        </Link>

        {/* Desktop Categories Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-[12px] font-bold tracking-wider text-muted-foreground">
          {displayCategories.slice(0, 5).map((cat: any) => {
            const catSlug = cat.slug || cat.name.toLowerCase().replace(/ /g, '-');
            const isActive = location.pathname === `/categories/${catSlug}`;
            return (
              <Link
                key={cat._id}
                to={`/categories/${catSlug}`}
                className={`uppercase hover:text-foreground relative py-1 transition-colors ${
                  isActive ? "text-foreground font-extrabold after:scale-x-100" : ""
                } after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#0F172A] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300`}
              >
                {cat.name}
              </Link>
            );
          })}
          <Link
            to="/categories"
            className="uppercase hover:text-foreground relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#0F172A] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 transition-colors"
          >
            All Categories
          </Link>
        </nav>

        {/* Desktop Search & Actions */}
        <div className="hidden md:flex items-center gap-6 flex-shrink-0">
          {/* Pill-shaped search bar with black button */}
          <form onSubmit={handleSearch} className="relative flex items-center w-[240px] lg:w-[280px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search HBGO..."
              className="w-full bg-background border border-border rounded-full pl-4 pr-12 py-1.5 text-[11px] focus:outline-none focus:border-foreground/45 transition-all placeholder:text-muted-foreground/60 font-medium"
            />
            <button
              type="submit"
              className="absolute right-0.5 top-1/2 -translate-y-1/2 bg-[#0F172A] text-white hover:bg-neutral-800 transition-colors w-[28px] h-[28px] rounded-full flex items-center justify-center"
              aria-label="Search"
            >
              <Search size={12} strokeWidth={2.5} />
            </button>
          </form>

          {/* Action Icons */}
          <div className="flex items-center gap-4 text-foreground">
            {/* Wishlist */}
            <Link to="/profile?tab=wishlist" aria-label="Wishlist" className="hover:opacity-70 transition-opacity relative p-1">
              <Heart size={20} className="stroke-[1.8]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 bg-[#0F172A] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" aria-label="Cart" className="hover:opacity-70 transition-opacity relative p-1">
              <ShoppingCart size={20} className="stroke-[1.8]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 bg-[#DC2626] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile / Dashboard */}
            <Link 
              to="/profile" 
              aria-label="Profile" 
              className="hover:opacity-70 transition-opacity p-1"
            >
              <User size={20} className="stroke-[1.8]" />
            </Link>
          </div>
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden flex items-center justify-between w-full relative h-full">
          {/* Hamburger Menu Toggle (Left) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground p-1 z-10 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Business Name (Center) */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-0">
            <Link 
              to="/" 
              className="flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <img src={settings?.logoUrl || "/image.jpeg"} alt="HBGO Logo" className="h-10 w-auto object-contain rounded" />
            </Link>
          </div>

          {/* Icon Cluster (Right) */}
          <div className="flex items-center gap-1.5 z-10">
            {/* Search Icon */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className={`p-1.5 rounded-full transition-colors ${showMobileSearch ? "bg-secondary text-primary" : "text-foreground"}`}
              aria-label="Toggle search"
            >
              <Search size={18} className="stroke-[1.8]" />
            </button>

            {/* Wishlist */}
            <Link to="/profile?tab=wishlist" className="text-foreground p-1.5 relative" aria-label="Wishlist">
              <Heart size={18} className="stroke-[1.8]" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-[13px] h-[13px] bg-[#0F172A] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Profile / Dashboard */}
            <Link 
              to="/profile" 
              className="text-foreground p-1.5" 
              aria-label="Profile"
            >
              <User size={18} className="stroke-[1.8]" />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="text-foreground p-1.5 relative" aria-label="Cart">
              <ShoppingCart size={18} className="stroke-[1.8]" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-[13px] h-[13px] bg-[#DC2626] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Down Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden border-t border-border bg-card px-4 py-2 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearch} className="relative flex items-center w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search HBGO..."
              className="w-full bg-background border border-border rounded-full pl-4 pr-12 py-1.5 text-xs focus:outline-none focus:border-foreground/50 font-medium"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-0.5 top-1/2 -translate-y-1/2 bg-[#0F172A] text-white w-[28px] h-[28px] rounded-full flex items-center justify-center"
              aria-label="Search"
            >
              <Search size={12} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Dropdown Category/Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border px-4 py-4 flex flex-col gap-3 text-sm font-medium text-foreground shadow-lg animate-in fade-in duration-200 max-h-[80vh] overflow-y-auto">
          {/* Location option */}
          <button 
            onClick={requestLocation}
            onMouseDown={() => clearError()}
            className="flex items-center gap-2 py-2 border-b border-border text-muted-foreground hover:text-primary text-xs"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin text-primary" />
            ) : (
              <MapPin size={14} className="text-accent" />
            )}
            <span className="truncate max-w-[200px]">
              {userLocation || (error ? "Retry Location" : "Set Location")}
            </span>
          </button>

          {/* Categories */}
          <div className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mt-2 mb-1">
            Shop By Category
          </div>
          {displayCategories.map((cat: any) => {
            const catSlug = cat.slug || cat.name.toLowerCase().replace(/ /g, '-');
            return (
              <Link
                key={cat._id}
                to={`/categories/${catSlug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-primary transition-colors border-b border-border text-xs uppercase font-semibold tracking-wider"
              >
                {cat.name}
              </Link>
            );
          })}
          
          <Link 
            to="/categories" 
            onClick={() => setMobileMenuOpen(false)} 
            className="py-2 hover:text-primary transition-colors border-b border-border text-xs uppercase font-semibold tracking-wider"
          >
            All Categories
          </Link>
          
          {/* Quick Nav Links */}
          <div className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mt-4 mb-1">
            Quick Links
          </div>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors border-b border-border text-xs uppercase">Home</Link>
          <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors border-b border-border text-xs uppercase">My Orders</Link>
          <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors text-xs uppercase">My Profile</Link>
        </div>
      )}
    </header>
  );
}
