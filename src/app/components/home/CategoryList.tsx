import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { useGetCategories } from "../../hooks/useData";

function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 w-[68px] sm:w-20 animate-pulse">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted" />
      <div className="h-3 w-12 bg-muted rounded-full" />
    </div>
  );
}

export function CategoryList() {
  const { data: categories, isLoading } = useGetCategories();

  return (
    <section className="max-w-[1400px] mx-auto px-4 pb-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-poppins font-bold text-foreground text-xl tracking-tight">Shop by Category</h2>
        <Link to="/categories" className="text-primary text-[12px] font-bold tracking-wider uppercase border border-primary/20 rounded-full px-4 py-1.5 hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/20 transition-all flex items-center gap-1">
          VIEW ALL <ChevronRight size={14} />
        </Link>
      </div>
      <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(12, minmax(68px, 1fr))", minWidth: "max-content" }}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)
            : (categories || []).map((cat: any) => {
                const lowerName = cat.name.toLowerCase();
                let borderColor = "";
                if (lowerName.includes("men")) borderColor = "#132B57";
                else if (lowerName.includes("women")) borderColor = "#DD500B";
                else if (lowerName.includes("kid")) borderColor = "#16773A";
                else if (lowerName.includes("footwear")) borderColor = "#1E3A5F";
                else if (lowerName.includes("beauty")) borderColor = "#D4AF37";

                return (
                  <Link
                    key={cat._id}
                    to={`/categories/${cat.slug || cat.name.toLowerCase().replace(/ /g, '-')}`}
                    className="flex flex-col items-center gap-2 group w-[68px] sm:w-20"
                  >
                    <div 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border bg-card group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300"
                      style={{ borderColor: borderColor || 'var(--border)' }}
                    >
                      <img
                        src={cat.image || "/placeholder.png"}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span 
                      className="text-[11px] font-semibold text-center leading-tight transition-colors tracking-wide"
                      style={{ color: borderColor || 'var(--muted-foreground)' }}
                    >
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
