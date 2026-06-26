import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { ProductCard } from "../product/ProductCard";

function ProductCardSkeleton({ grid }: { grid?: boolean }) {
  return (
    <div className={`bg-card rounded-2xl border border-border overflow-hidden animate-pulse ${grid ? "w-full" : "flex-shrink-0 w-48 sm:w-52"}`}>
      <div className="bg-muted h-44" />
      <div className="p-4 space-y-2">
        <div className="h-2 w-16 bg-muted rounded-full" />
        <div className="h-4 w-full bg-muted rounded-full" />
        <div className="h-4 w-2/3 bg-muted rounded-full" />
        <div className="h-5 w-24 bg-muted rounded-full mt-3" />
      </div>
    </div>
  );
}

export function ProductSection({
  title,
  layout,
  viewAllTo,
  sort = "newest",
}: {
  title: string;
  layout: "scroll" | "grid";
  viewAllTo?: string;
  sort?: "newest" | "top";
}) {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products-all"],  // shared key — both sections reuse one fetch
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data.data as any[];
    },
    select: (all) => {
      if (sort === "newest") {
        return [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 12);
      }
      return [...all].sort((a, b) => (b.rating || 0) - (a.rating || 0) || (a.stock || 0) - (b.stock || 0));
    },
  });

  const skeletonCount = layout === "scroll" ? 6 : 12;

  return (
    <section className="max-w-[1400px] mx-auto px-4 pb-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-poppins font-bold text-foreground text-xl">{title}</h2>
        {viewAllTo && (
          <Link to={viewAllTo} className="text-primary text-[13px] font-semibold border border-primary rounded-full px-3.5 py-1 hover:bg-primary hover:text-white transition-colors flex items-center gap-1">
            VIEW ALL <ChevronRight size={13} />
          </Link>
        )}
      </div>

      {layout === "scroll" ? (
        <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-3.5">
            {isLoading
              ? Array.from({ length: skeletonCount }).map((_, i) => <ProductCardSkeleton key={i} />)
              : (products || []).map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {isLoading
            ? Array.from({ length: skeletonCount }).map((_, i) => <ProductCardSkeleton key={i} grid />)
            : (products || []).map((product: any) => (
                <ProductCard key={product._id} product={product} grid />
              ))}
        </div>
      )}
    </section>
  );
}
