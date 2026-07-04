# HBGO — Figma Design Prompt
*(Reference: dynamokart.com layout, adapted to blue/teal tech identity + mobile-only catalog)*

---

## 1. PROJECT BRIEF (paste this as context in Figma AI / give to designer)

Design a complete, responsive e-commerce website UI for **HBGO**, a mobile phones, accessories, spares & service retailer based in Yellamanchili, Anakapalli District, Andhra Pradesh. The business sells **both retail and wholesale**, has a physical store (running since 2023), and wants a modern marketplace-style website similar to DynamoKart's layout — but rebuilt entirely in a **blue/teal tech, trustworthy** visual identity suited to a mobile/electronics brand (not the orange/navy DynamoKart palette).

Design for **Desktop (1440px)**, **Tablet (768px)**, and **Mobile (390px)** breakpoints, with a **bottom tab bar on mobile** replacing the top nav (Home / Categories / Cart / Orders / Profile).

---

## 2. BRAND IDENTITY

- **Brand name:** HBGO
- **Tagline suggestion:** "Your Trusted Mobile Store" / "Mobiles • Accessories • Service"
- **Owner:** Boddapu Lokesh
- **Location:** Near RTC Complex, Yellamanchili, Anakapalli District, AP — 531055
- **Contact:** 6300200986 | hbgo@gmail.com

### Color Palette (Blue/Teal — Tech & Trustworthy)
| Role | Color | Hex |
|---|---|---|
| Primary | Deep Teal-Blue | `#0B5E6F` or `#0E7C8C` |
| Primary Dark (header/footer bg) | Midnight Teal | `#0A2E36` |
| Accent / CTA | Vivid Cyan-Blue | `#00B4D8` |
| Secondary Accent (Add to Cart, badges) | Warm Orange (retained from reference for contrast + urgency, used sparingly) | `#FF7A00` |
| Success / In-stock | Emerald | `#1FAA59` |
| Discount badge | Electric Blue | `#2563EB` |
| Background | Off-white | `#F7FAFB` |
| Card background | White | `#FFFFFF` |
| Text primary | Charcoal Teal | `#0F2A2E` |
| Text secondary | Slate Grey | `#5B7177` |
| Border/divider | Light teal-grey | `#E1ECEE` |

### Typography
- Headings: **Poppins SemiBold/Bold** (matches DynamoKart's bold geometric headline style)
- Body/UI: **Inter Regular/Medium**
- Prices: **Inter Bold**, strikethrough MRP in grey, discount % in small blue/white pill

### Logo Concept
Stylized "S" or phone-icon mark in cyan-blue gradient, paired with wordmark "HBGO" in deep teal, small tagline underneath in grey — mirroring DynamoKart's logo-lockup-with-tagline structure but phone-themed instead of cart/delivery-themed.

---

## 3. SITE MAP / SCREENS TO DESIGN

1. Homepage
2. Category Listing Page (e.g., "Mobiles", "Earphones")
3. Product Detail Page
4. Cart Page
5. Checkout Flow (Address → Payment → Confirmation)
6. Order Tracking Page (Tracking ID + URL)
7. Order History / "My Orders"
8. Login / Signup
9. Admin Dashboard (separate design system — see Section 7)

---

## 4. HOMEPAGE — DETAILED LAYOUT SPEC

### 4.1 Header (sticky, white background)
- Left: HBGO logo
- Location selector: "📍 Select Location ⌄" (Yellamanchili / Anakapalli default)
- Center: Search bar — placeholder *"Search for mobiles, accessories, brands..."*
- Right: Home | Categories | Orders | Profile (text nav, desktop only)
- Icon cluster: Wishlist (heart), Dark mode toggle, Notifications (bell), Cart (with item-count badge), Profile avatar (circular, teal background)

### 4.2 Category Pill Bar (dark teal band, horizontal scroll)
Pills: **All | Mobiles | Keypad Mobiles | Accessories | Spares | Service**
- Active pill: white background, teal text, rounded-full
- Inactive: translucent white text on dark teal, rounded-full outline

### 4.3 Hero Banner (inside dark teal band)
- Large banner, dark teal/navy photographic background (e.g., latest smartphone close-up or store photo)
- Bold white headline: *"Power Up Your Pocket"* / *"Latest Mobiles. Best Prices."*
- Sub-line: *"New Arrivals This Week"*
- CTA button: cyan-blue **"SHOP NOW"**, rounded
- Carousel dots bottom-right (white/cyan)

### 4.4 Secondary Promo Tiles (4-up row below hero)
Cards with photo + "OFFER" badge (cyan pill) + label:
1. **Mobile Offers** (smartphones flat-lay)
2. **Accessories Sale** (earphones/cables)
3. **Service Center** (technician repairing phone)
4. **Wholesale Deals** (bulk mobiles/boxes)

### 4.5 Shop by Category (circular icons grid)
Two rows, circular product photos, label below each, centered grid:

Row 1: **Mobiles · Keypad Mobiles · Pouches & Cases · Tempered Glass**
Row 2: **Chargers · Cables · Earphones · Power Banks**
Row 3 (mobile: scroll / desktop: wraps): **Buds · Neckbands · Batteries · Speakers**

"VIEW ALL ›" link top-right of section, teal text, pill-outline button.

### 4.6 Service Banner Strip (replaces "Lightning Deals")
Horizontal strip, light cyan-tinted background:
- ⚡ icon + **"Mobile Service Available"** — *Display Replacement · Battery Change · Dead Board Recovery*
- CTA: **"Book Service"** button, outlined teal

### 4.7 Trending Now (horizontal scroll product cards)
Card anatomy (white card, rounded-xl, subtle shadow):
- Top-left: Discount badge — blue pill, e.g. "20% OFF"
- Top-right: Wishlist heart icon (circular white bg)
- Product image (square, centered, padded)
- Brand name (uppercase, small grey) — e.g. SAMSUNG, REDMI, BOAT
- Product title (bold, 1-2 lines) — e.g. "Galaxy M14 5G"
- ⭐ Rating + review count + 📍 distance ("0.5 km" → could repurpose as "In Stock at Store")
- Price row: discounted price (bold teal) + strikethrough MRP (grey)
- Orange **"ADD"** button, bottom-right of card

Suggested sample products to mock: Samsung Galaxy phone, Redmi keypad phone, boAt earbuds, generic tempered glass pack, fast charger, power bank.

### 4.8 Top Picks For You (grid, same card component)
Mix of accessories + mobiles to show catalog range: earphones, neckband, charger, power bank, phone pouch.

### 4.9 Footer (dark teal, `#0A2E36` background, white/grey text)
5-column layout:
- **Brand block:** Logo + tagline + 1-line description ("Your one-stop destination for mobiles, accessories, spares, and trusted repair service — retail & wholesale.") + social icons (Facebook, Instagram, WhatsApp, YouTube)
- **Shop:** Categories · All Products · New Arrivals · Best Sellers · Brands
- **My Account:** My Profile · Orders · Wishlist · Address Book
- **Help & Support:** Help Center · Shipping Policy · Returns & Refunds · Cancellation Policy · FAQs · Contact Us
- **About Us:** About HBGO · Become a Wholesale Partner · Terms & Conditions
- **Get in Touch:** 📍 Near RTC Complex, Yellamanchili, Anakapalli Dist – 531055 · ✉️ hbgo@gmail.com · 📞 +91 63002 00986 · 🛡️ "100% Secure Payments"

Bottom trust strip (4-up icons): **Genuine Products | Easy Returns | Fast Delivery | Secure Payments**
Payment badges: Visa, Mastercard, UPI, Paytm, COD
Copyright line: "© 2026 HBGO. All rights reserved."

---

## 5. MOBILE LAYOUT NOTES (390px)

- Top bar collapses to: logo + search icon + cart icon + profile avatar
- Category pills scroll horizontally
- Hero banner stacks full-width, text overlays image
- Promo tiles: 2-up grid
- Category circles: horizontal scroll, 4 visible at a time
- Product cards: 2-up grid
- **Bottom tab bar (fixed):** 🏠 Home · 🗂 Categories · 🛒 Cart · 📦 Orders · 👤 Profile — active tab in cyan-blue, inactive in grey

---

## 6. PRODUCT DETAIL PAGE — KEY COMPONENTS

- Image gallery (left): main image + thumbnail strip, zoom-on-hover (desktop)
- Right panel: Brand · Product title · Rating + review count · Price block (MRP strikethrough + discount % + final price) · Stock status (green "In Stock" tag) · Variant selector (Color / Storage, if applicable — e.g., 64GB/128GB) · Quantity stepper · **ADD TO CART** (outline teal) + **BUY NOW** (filled cyan-blue) buttons side-by-side
- Delivery check: pincode input + "Check Availability"
- Tabs below: Description | Specifications | Reviews
- "Customers Also Bought" carousel (same product card component)

---

## 7. CART, CHECKOUT & TRACKING

**Cart Page:** Line items (image, title, variant, price, qty stepper, remove), order summary card (subtotal, delivery fee, discount, total), sticky "Proceed to Checkout" button.

**Checkout:** Step indicator (Address → Payment → Review), saved address cards, payment method radio cards (UPI / Card / COD), order summary sidebar (desktop) / accordion (mobile).

**Order Tracking Page:** Enter Tracking ID or auto-shown post-order. Visual horizontal stepper: **Order Placed → Packed → Shipped → Out for Delivery → Delivered**, with tracking URL link button, estimated delivery date, order details card below.

**My Orders / History:** List of past orders, status chip (color-coded: pending=amber, packed=blue, shipped=teal, completed=green), "Track Order" + "Reorder" buttons per item.

---

## 8. ADMIN DASHBOARD — SEPARATE DESIGN SYSTEM

Use a **darker, denser, data-focused** UI (sidebar nav layout, not the consumer storefront style):

- **Sidebar (dark teal, fixed left):** Dashboard · Products (Add/Edit/Remove) · Categories · Orders (Pending/Packed/Shipped/Completed tabs) · Pricing & Stock · Sales Reports · Banners & Homepage · Tracking ID Management · Content/Settings
- **Top bar:** Search, admin profile, notifications
- **Dashboard home:** KPI cards (Today's Orders, Revenue, Pending Orders, Low Stock Alerts) + sales chart (line/bar, teal/cyan gradient) + recent orders table
- **Product management table:** image thumb, name, category, price, stock qty, status toggle, edit/delete icons
- **Order management:** kanban-style or tabbed table by status, with bulk action bar
- **Banner management:** drag-and-drop / upload cards for homepage hero + promo tiles
- Use data tables with zebra striping, status chips matching the color codes from Section 7

---

## 9. COMPONENT LIBRARY TO BUILD IN FIGMA (for consistency)

- Buttons: Primary (filled cyan-blue), Secondary (outline teal), CTA-Add (filled orange), Disabled
- Product Card (default + compact variants)
- Category Circle Icon
- Discount Badge pill
- Status Chip (pending/packed/shipped/completed/delivered)
- Search Bar
- Rating Stars + count
- Price Block (MRP + discount + final)
- Bottom Tab Bar (mobile)
- Header (desktop + mobile states)
- Footer
- Toast/Notification (Added to Cart confirmation)

---

## 10. DESIGN TONE SUMMARY

Keep DynamoKart's proven **information density and card-grid marketplace rhythm**, but swap its navy/orange "general marketplace" feel for a **focused, trustworthy mobile-tech identity**: cleaner cyan-blue accents, teal-dark surfaces for header/footer/hero, and category iconography centered entirely on phones, accessories, spares, and service — reinforcing HBGO as a specialist store, not a generic marketplace.