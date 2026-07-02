import { Helmet } from "react-helmet-async";
import { HeroSection } from "../components/home/HeroSection";
import { PromoTiles } from "../components/home/PromoTiles";
import { CategoryList } from "../components/home/CategoryList";
import { ServiceStrip } from "../components/home/ServiceStrip";
import { ProductSection } from "../components/home/ProductSection";

export function Home() {
  return (
    <div className="bg-gradient-to-b from-primary/15 via-primary/5 to-accent/15 min-h-screen">
      <Helmet>
        <title>HBGO | Best Deals on Electronics & Fashion</title>
        <meta name="description" content="Shop the latest electronics, fashion, and lifestyle products at HBGO." />
      </Helmet>
      <div className="pt-2">
        <HeroSection />
      </div>
      <div className="py-4">
        <PromoTiles />
      </div>
      <div className="py-4 my-2">
        <CategoryList />
      </div>
      <div className="py-4">
        <ServiceStrip />
      </div>
      <div className="py-8">
        <ProductSection title="Trending Now" layout="scroll" viewAllTo="/categories" sort="newest" />
      </div>
      <div className="pt-8 pb-12">
        <ProductSection title="Top Picks For You" layout="grid" viewAllTo="/categories" sort="top" />
      </div>
    </div>
  );
}
