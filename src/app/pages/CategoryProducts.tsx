import { useParams, Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { ProductCard } from "../components/product/ProductCard";
import { ChevronRight } from "lucide-react";
import { useGetProducts } from "../hooks/useData";

function ProductSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="bg-muted h-44" />
      <div className="p-4 space-y-2">
        <div className="h-2 w-16 bg-muted rounded-full" />
        <div className="h-4 w-full bg-muted rounded-full" />
        <div className="h-5 w-24 bg-muted rounded-full mt-3" />
      </div>
    </div>
  );
}

export function CategoryProducts() {
  const { slug } = useParams();
  const categoryName = slug?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || "Category";

  const { data: products, isLoading } = useGetProducts({ category: slug || "" });

  return (
    <>
      <Helmet>
        <title>{categoryName} | HBGO</title>
        <meta name="description" content={`Shop the best ${categoryName} at HBGO.`} />
      </Helmet>

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/categories" className="hover:text-primary transition-colors">Categories</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">{categoryName}</span>
        </div>

        <h1 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mb-6">{categoryName}</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📦</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No products found</h2>
            <p className="text-muted-foreground mb-6">We couldn't find any products in this category.</p>
            <Link to="/categories" className="bg-primary text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
              Browse Other Categories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} grid />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
