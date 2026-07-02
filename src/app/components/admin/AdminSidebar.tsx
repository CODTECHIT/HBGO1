import { Link, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, ShoppingBag, Layers, ShoppingCart, Image as ImageIcon, BarChart3, Users, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export function AdminSidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const NAV_ITEMS = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "HBGO", path: "/admin/HBGO", icon: ShoppingBag },
    { label: "Categories", path: "/admin/categories", icon: Layers },
    { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { label: "Banners", path: "/admin/banners", icon: ImageIcon },
    { label: "Reports", path: "/admin/reports", icon: BarChart3 },
    { label: "Customers", path: "/admin/customers", icon: Users },
    { label: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-[#0A2E36] text-white z-50 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 font-poppins font-bold text-xl tracking-wide border-b border-white/10 flex-shrink-0">
          HBGO <span className="text-[#00B4D8] ml-1">ADMIN</span>
        </div>

        {/* Nav items — scrollable, fills remaining space */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                  isActive ? "bg-[#00B4D8] text-white shadow-md shadow-[#00B4D8]/20" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout — pinned to bottom */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all font-medium text-sm group"
          >
            <LogOut size={18} className="group-hover:rotate-12 transition-transform duration-200" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
