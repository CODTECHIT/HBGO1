import { Helmet } from "react-helmet-async";
import { Phone, MapPin, Mail, Award, Users, Star, ShieldCheck } from "lucide-react";
import { useGetSettings } from "../hooks/useData";

export function AboutUs() {
  const { data: settings } = useGetSettings();

  return (
    <>
      <Helmet>
        <title>About Us | HBGO</title>
        <meta
          name="description"
          content="Learn about HBGO — your trusted destination for electronics, fashion, and lifestyle products in Kadapa."
        />
      </Helmet>

      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wider uppercase">
            Our Story
          </span>
          <h1 className="font-poppins font-bold text-4xl md:text-5xl text-foreground mb-4 leading-tight">
            About <span className="text-primary">HBGO</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Your one-stop destination for electronics, fashion, beauty, and home essentials — serving Kadapa and beyond.
          </p>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-primary text-white py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Users, value: "1000+", label: "Happy Customers" },
              { icon: Phone, value: "500+", label: "Devices Sold" },
              { icon: Star, value: "4.8★", label: "Average Rating" },
              { icon: ShieldCheck, value: "100%", label: "Genuine Products" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon size={22} className="opacity-80 mb-1" />
                <p className="font-poppins font-bold text-2xl">{value}</p>
                <p className="text-white/70 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About the Store ── */}
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-accent/10 text-accent text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                Who We Are
              </span>
              <h2 className="font-poppins font-bold text-3xl text-foreground mb-5 leading-tight">
                Trusted E-Commerce <br /> in Kadapa
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                HBGO is a leading retail and e-commerce store located in Vempalli, Kadapa. We specialize in electronics, men's & women's fashion, footwear, beauty products, and home essentials.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Whether you're looking for the newest gadgets, trendy clothing, or lifestyle products — HBGO has you covered. We take pride in offering quality products with transparent pricing and great support.
              </p>
              <div className="space-y-3">
                {[
                  { icon: MapPin, text: settings?.address || "Vempalli, Kadapa, (district), Andhra Pradesh" },
                  { icon: Mail, text: settings?.email || "[Email To be filled]" },
                  { icon: Phone, text: settings?.phone || "[Phone To be filled]" },
                ].map(({ icon: Icon, text }) => (
                  <p key={text} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Icon size={15} className="text-primary flex-shrink-0 mt-0.5" />
                    {text}
                  </p>
                ))}
              </div>
            </div>

            {/* Values Cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ShieldCheck, title: "100% Genuine", desc: "Every product we sell is authenticated and sourced from authorized distributors.", color: "from-primary/10 to-primary/5" },
                { icon: Award, title: "Best Prices", desc: "Competitive pricing on retail and wholesale — no hidden charges.", color: "from-accent/10 to-accent/5" },
                { icon: Star, title: "Top Brands", desc: "Samsung, Apple, Realme, Xiaomi, Vivo, Oppo and more.", color: "from-yellow-500/10 to-yellow-500/5" },
                { icon: Users, title: "Customer First", desc: "We believe in long-term relationships, not just one-time sales.", color: "from-green-500/10 to-green-500/5" },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className={`bg-gradient-to-br ${color} rounded-2xl p-5 border border-border/60`}>
                  <Icon size={22} className="text-primary mb-3" />
                  <p className="font-poppins font-semibold text-sm text-foreground mb-1">{title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── About the Founder ── */}
      <section className="py-16 md:py-20 bg-secondary/40">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-3 uppercase tracking-wider">
              The Face Behind {settings?.storeName || "HBGO"}
            </span>
            <h2 className="font-poppins font-bold text-3xl text-foreground">Meet the Founder</h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 max-w-4xl mx-auto">
            {/* Founder Photo */}
            <div className="flex-shrink-0 relative">
              <div className="w-60 h-72 md:w-72 md:h-80 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-primary/20">
                <img
                  src={settings?.logoUrl || "/image.jpeg"}
                  alt={`Founder of ${settings?.storeName || "HBGO"}`}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                Founder & CEO
              </div>
            </div>

            {/* Founder Bio */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mb-1">
                Syed Mahammad Gouse & Shaik Habib
              </h3>
              <p className="text-primary font-semibold text-sm mb-5">Founders, HBGO, Kadapa</p>

              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                With a deep passion for commerce and a commitment to serving the community, our founders established HBGO with a simple vision — to make quality products accessible to everyone in Kadapa and surrounding areas.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                From humble beginnings to a growing e-commerce platform, the journey reflects relentless dedication, hard work, and an unwavering focus on customer satisfaction.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                "Our customers are our family. Every product we sell is built on trust." — <span className="text-foreground font-medium italic">HBGO Founders</span>
              </p>

              {/* Social / Highlights */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {["Mobile Enthusiast", "Community Builder", "Tech Entrepreneur", "Yellamanchili Local"].map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-14 bg-gradient-to-r from-primary to-accent text-white">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="font-poppins font-bold text-2xl md:text-3xl mb-3">
            Come Visit Us Today
          </h2>
          <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
            Walk into our store in {settings?.address || "Vempalli, Kadapa"} — or shop right here on our website with home delivery.
          </p>
          <a
            href={`tel:${settings?.phone}`}
            className="inline-flex items-center gap-2 bg-white text-primary font-poppins font-semibold text-sm px-7 py-3 rounded-full hover:bg-white/90 transition-colors shadow-lg"
          >
            <Phone size={15} />
            Contact Us
          </a>
        </div>
      </section>
    </>
  );
}
