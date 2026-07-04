import { useSearchParams, Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { ProductCard } from "../components/product/ProductCard";
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

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: searchResults, isLoading } = useGetProducts({ q: query });

  return (
    <>
      <Helmet>
        <title>Search Results for "{query}" | HBGO</title>
      </Helmet>

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="font-poppins font-bold text-2xl text-foreground mb-2">Search Results</h1>
        <p className="text-muted-foreground mb-8">
          Showing results for "<span className="font-semibold text-foreground">{query}</span>"
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : !searchResults || searchResults.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6">We couldn't find any products matching "{query}".</p>
            <Link to="/" className="bg-primary text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
              Return Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {searchResults.map((product: any) => (
              <ProductCard key={product._id} product={product} grid />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
