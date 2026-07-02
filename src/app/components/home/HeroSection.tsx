import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { useGetCategories } from "../../hooks/useData";

const FALLBACK_BANNERS = [
  {
    _id: "f1",
    title: "Best Mobiles at Best Prices",
    subtitle: "Shop top brands — Apple, Samsung, Vivo, Oppo & more",
    tag: "NEW ARRIVALS",
    image:
      "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=1280&q=80",
    redirectUrl: "/categories",
  },
  {
    _id: "f2",
    title: "Accessories Sale",
    subtitle: "Earphones, cases, chargers — huge discounts",
    tag: "SALE",
    image:
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1280&q=80",
    redirectUrl: "/categories",
  },
];

function HeroSkeleton() {
  return (
    <section className="pt-4 pb-8 rounded-[2rem] mx-2 sm:mx-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
      {/* Category pills skeleton */}
      <div className="overflow-x-auto mb-6" style={{ scrollbarWidth: "none" }}>
        <div
          className="flex items-center gap-3 px-4 py-2 max-w-[1400px] mx-auto"
          style={{ minWidth: "max-content" }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-20 rounded-full bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
      {/* Banner skeleton */}
      <div className="relative overflow-hidden mx-4 rounded-3xl max-w-[1400px] lg:mx-auto border border-border/50">
        <div className="h-64 sm:h-72 md:h-96 lg:h-[32rem] bg-muted animate-pulse rounded-3xl" />
      </div>
    </section>
  );
}

export function HeroSection() {
  const [currentBanner, setCurrentBanner] = useState(0);

  // Fetch hero banners from DB
  const { data: dbBanners, isLoading: bannersLoading } = useQuery({
    queryKey: ["hero-banners"],
    queryFn: async () => {
      const { data } = await api.get("/banners?type=hero");
      return data.data as any[];
    },
  });

  const { data: categories, isLoading: catsLoading } = useGetCategories();
  const location = useLocation();

  const banners =
    dbBanners && dbBanners.length > 0 ? dbBanners : FALLBACK_BANNERS;

  // useEffect MUST be before any early return (Rules of Hooks)
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner((b) => (b + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (bannersLoading && catsLoading) return <HeroSkeleton />;

  return (
    <section className="pt-4 pb-8 rounded-[2rem] mx-2 sm:mx-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
      {/* Category pills — navigate to category pages */}
      <div className="overflow-x-auto mb-6" style={{ scrollbarWidth: "none" }}>
        <div
          className="flex items-center gap-3 px-4 py-2 max-w-[1400px] mx-auto"
          style={{ minWidth: "max-content" }}
        >
          {/* "All" pill */}
          <Link
            to="/categories"
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex-shrink-0 border ${
              location.pathname === "/categories" || location.pathname === "/"
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                : "bg-card border-border text-foreground/70 hover:border-primary/50 hover:text-primary"
            }`}
          >
            All
          </Link>
          {/* Category pills from DB */}
          {(categories || []).map((cat: any) => {
            const slug = cat.slug || cat.name.toLowerCase().replace(/ /g, "-");
            const href = `/categories/${slug}`;
            const isActive = location.pathname === href;
            return (
              <Link
                key={cat._id}
                to={href}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex-shrink-0 border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                    : "bg-card border-border text-foreground/70 hover:border-primary/50 hover:text-primary"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Hero banner carousel */}
      <div className="relative overflow-hidden mx-4 rounded-3xl max-w-[1400px] lg:mx-auto border border-white/10 shadow-2xl shadow-slate-950/40">
        <div className="relative h-64 sm:h-72 md:h-96 lg:h-[32rem] bg-secondary">
          {banners.map((banner: any, i: number) => (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === currentBanner ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
            >
              <img
                src={banner.image || banner.img}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.82)_0%,rgba(15,23,42,0.55)_48%,rgba(15,23,42,0.18)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_78%_22%,rgba(221,80,11,0.15),transparent_28%)]" />
            </div>
          ))}

          <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-8 md:px-16">
            {banners[currentBanner]?.tag && (
              <span className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full mb-2 sm:mb-4 w-fit tracking-wider uppercase shadow-sm">
                {banners[currentBanner].tag}
              </span>
            )}
            <h1 className="font-poppins font-bold text-foreground text-xl sm:text-3xl md:text-5xl lg:text-6xl leading-[1.15] max-w-xs sm:max-w-2xl tracking-tight">
              {banners[currentBanner]?.title}
            </h1>
            {banners[currentBanner]?.subtitle && (
              <p className="text-foreground/80 text-xs sm:text-base md:text-lg mt-2 sm:mt-4 mb-4 sm:mb-8 max-w-xs sm:max-w-xl font-medium line-clamp-2 sm:line-clamp-none">
                {banners[currentBanner].subtitle}
              </p>
            )}
            <Link
              to={banners[currentBanner]?.redirectUrl || "/categories"}
              className="bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-bold text-xs sm:text-sm md:text-base px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full transition-all duration-300 w-fit shadow-lg shadow-primary/30"
            >
              SHOP NOW
            </Link>
          </div>

          {/* Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-6 right-8 flex items-center gap-2.5">
              {banners.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrentBanner(i)}
                  aria-label={`Banner ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === currentBanner
                      ? "bg-primary w-8"
                      : "bg-primary/20 w-2 hover:bg-primary/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
