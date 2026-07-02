import { createBrowserRouter, Navigate } from "react-router";
import { lazy, Suspense } from "react";
import { MainLayout } from "../components/layout/MainLayout";

const Home = lazy(() => import("../pages/Home").then(m => ({ default: m.Home })));
const ProductDetails = lazy(() => import("../pages/ProductDetails").then(m => ({ default: m.ProductDetails })));
const Cart = lazy(() => import("../pages/Cart").then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import("../pages/Checkout").then(m => ({ default: m.Checkout })));
const Orders = lazy(() => import("../pages/Orders").then(m => ({ default: m.Orders })));
const Tracking = lazy(() => import("../pages/Tracking").then(m => ({ default: m.Tracking })));
const Profile = lazy(() => import("../pages/Profile").then(m => ({ default: m.Profile })));
const Login = lazy(() => import("../pages/Login").then(m => ({ default: m.Login })));
const Register = lazy(() => import("../pages/Register").then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword").then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import("../pages/ResetPassword").then(m => ({ default: m.ResetPassword })));
const Categories = lazy(() => import("../pages/Categories").then(m => ({ default: m.Categories })));
const CategoryProducts = lazy(() => import("../pages/CategoryProducts").then(m => ({ default: m.CategoryProducts })));
const Search = lazy(() => import("../pages/Search").then(m => ({ default: m.Search })));
const AboutUs = lazy(() => import("../pages/AboutUs").then(m => ({ default: m.AboutUs })));

// Admin
const ProtectedAdminRoute = lazy(() => import("../components/admin/ProtectedAdminRoute").then(m => ({ default: m.ProtectedAdminRoute })));
const AdminLayout = lazy(() => import("../components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const Dashboard = lazy(() => import("../pages/admin/Dashboard").then(m => ({ default: m.Dashboard })));
const AdminMobiles = lazy(() => import("../pages/admin/Mobiles").then(m => ({ default: m.Mobiles })));
const AdminCategories = lazy(() => import("../pages/admin/Categories").then(m => ({ default: m.Categories })));
const AdminOrders = lazy(() => import("../pages/admin/Orders").then(m => ({ default: m.Orders })));
const AdminBanners = lazy(() => import("../pages/admin/Banners").then(m => ({ default: m.Banners })));
const AdminReports = lazy(() => import("../pages/admin/Reports").then(m => ({ default: m.Reports })));
const AdminCustomers = lazy(() => import("../pages/admin/Customers").then(m => ({ default: m.Customers })));
const AdminSettings = lazy(() => import("../pages/admin/Settings").then(m => ({ default: m.Settings })));

const Loading = () => <div className="min-h-screen flex items-center justify-center text-primary">Loading...</div>;

const AdminLogin = lazy(() => import("../pages/admin/AdminLogin").then(m => ({ default: m.AdminLogin })));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Suspense fallback={<Loading />}><Home /></Suspense> },
      { path: "products/:id", element: <Suspense fallback={<Loading />}><ProductDetails /></Suspense> },
      { path: "cart", element: <Suspense fallback={<Loading />}><Cart /></Suspense> },
      { path: "checkout", element: <Suspense fallback={<Loading />}><Checkout /></Suspense> },
      { path: "orders", element: <Suspense fallback={<Loading />}><Orders /></Suspense> },
      { path: "tracking/:trackingId", element: <Suspense fallback={<Loading />}><Tracking /></Suspense> },
      { path: "profile", element: <Suspense fallback={<Loading />}><Profile /></Suspense> },
      { path: "login", element: <Suspense fallback={<Loading />}><Login /></Suspense> },
      { path: "register", element: <Suspense fallback={<Loading />}><Register /></Suspense> },
      { path: "forgot-password", element: <Suspense fallback={<Loading />}><ForgotPassword /></Suspense> },
      { path: "reset-password/:resetToken", element: <Suspense fallback={<Loading />}><ResetPassword /></Suspense> },
      { path: "categories", element: <Suspense fallback={<Loading />}><Categories /></Suspense> },
      { path: "categories/:slug", element: <Suspense fallback={<Loading />}><CategoryProducts /></Suspense> },
      { path: "search", element: <Suspense fallback={<Loading />}><Search /></Suspense> },
      { path: "about", element: <Suspense fallback={<Loading />}><AboutUs /></Suspense> },
      { path: "*", element: <div className="p-20 text-center font-poppins"><h1 className="text-4xl font-bold mb-4">404</h1><p className="text-muted-foreground">Page not found</p></div> },
    ],
  },
  {
    path: "/admin/login",
    element: <Suspense fallback={<Loading />}><AdminLogin /></Suspense>,
  },
  {
    path: "/admin",
    element: <Suspense fallback={<Loading />}><ProtectedAdminRoute /></Suspense>,
    children: [
      {
        path: "",
        element: <Suspense fallback={<Loading />}><AdminLayout /></Suspense>,
        children: [
          { index: true, element: <Navigate to="HBGO" replace /> },
          { path: "dashboard", element: <Suspense fallback={<Loading />}><Dashboard /></Suspense> },
          { path: "HBGO", element: <Suspense fallback={<Loading />}><AdminMobiles /></Suspense> },
          { path: "categories", element: <Suspense fallback={<Loading />}><AdminCategories /></Suspense> },
          { path: "orders", element: <Suspense fallback={<Loading />}><AdminOrders /></Suspense> },
          { path: "banners", element: <Suspense fallback={<Loading />}><AdminBanners /></Suspense> },
          { path: "reports", element: <Suspense fallback={<Loading />}><AdminReports /></Suspense> },
          { path: "customers", element: <Suspense fallback={<Loading />}><AdminCustomers /></Suspense> },
          { path: "settings", element: <Suspense fallback={<Loading />}><AdminSettings /></Suspense> },
        ]
      }
    ]
  }
]);
