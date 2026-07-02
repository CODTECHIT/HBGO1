import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { useGetCategories } from "../hooks/useData";

function CategorySkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-3 animate-pulse">
      <div className="w-20 h-20 rounded-full bg-muted" />
      <div className="h-3 w-20 bg-muted rounded-full" />
    </div>
  );
}

export function Categories() {
  const { data: categories, isLoading } = useGetCategories();

  return (
    <>
      <Helmet>
        <title>All Categories | HBGO</title>
        <meta name="description" content="Browse all categories of products at HBGO." />
      </Helmet>

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="font-poppins font-bold text-2xl text-foreground mb-6">Shop by Category</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <CategorySkeleton key={i} />)}
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">No categories found</h2>
            <p className="text-muted-foreground">We currently don't have any categories available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat: any) => {
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
                  className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-3 hover:shadow-md transition-all group"
                  style={borderColor ? { borderBottomColor: borderColor, borderBottomWidth: '4px' } : {}}
                >
                  <div 
                    className="w-20 h-20 rounded-full overflow-hidden border-2 border-border transition-colors"
                    style={borderColor ? { borderColor: borderColor } : {}}
                  >
                    <img
                      src={cat.image || "/placeholder.png"}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span 
                    className="font-poppins font-medium text-foreground text-sm text-center transition-colors"
                    style={borderColor ? { color: borderColor } : {}}
                  >
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
