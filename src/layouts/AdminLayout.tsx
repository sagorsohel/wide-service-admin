import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Bell,
  Search,
  LogOut,
  ShieldCheck,
  Sparkles,
  FolderKanban,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { logout } from "@/redux/slices/authSlice";

export const AdminLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const isSuperAdmin = user?.role === "superadmin";

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    ...(isSuperAdmin
      ? [
          { label: "Categories", path: "/categories", icon: FolderKanban },
          { label: "Subcategories", path: "/subcategories", icon: Layers },
          { label: "Users", path: "/users", icon: Users }
        ]
      : []),
    { label: "Services", path: "/services", icon: Briefcase },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const getRoleBadge = (role?: string) => {
    if (role === "superadmin") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <ShieldCheck className="w-3 h-3" /> Super Admin
        </span>
      );
    }
    if (role === "creator") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Sparkles className="w-3 h-3" /> Creator
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        {role || "Staff"}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="h-16 px-6 border-b border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            W
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-tight text-slate-900">
              Wide Admin
            </h1>
            <span className="text-xs text-slate-400">Control Center</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Profile Card at bottom of sidebar */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "WS"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.name || "Authenticated User"}
              </p>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                {user?.phone || "018XXXXXXXX"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources, users, tasks..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {getRoleBadge(user?.role)}

            <Button variant="ghost" size="icon" className="relative text-slate-500">
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2 right-2 ring-2 ring-white"></span>
            </Button>

            <div className="h-6 w-px bg-slate-200" />

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
