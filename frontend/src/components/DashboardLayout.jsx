import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Button } from "./ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({ title, links, testid }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[hsl(48,33%,97%)]" data-testid={testid}>
      {/* Sidebar */}
      <aside className={`${open ? "fixed inset-0 z-40 w-full" : "hidden"} lg:block lg:relative lg:w-64 flex-shrink-0 bg-slate-900 text-slate-100`}>
        <div className="p-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-amber-600 text-white font-display font-bold">M</span>
            <span className="font-display text-lg font-bold text-white">MyTown</span>
          </Link>
          <button className="lg:hidden text-slate-300" onClick={() => setOpen(false)}><X /></button>
        </div>
        <div className="px-5 pb-2 text-xs uppercase tracking-[0.2em] text-slate-500">{title}</div>
        <nav className="px-3 py-3 space-y-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
              }
              data-testid={`sidenav-${l.to.replaceAll("/", "-")}`}
            >
              {l.icon ? <l.icon className="h-4 w-4" /> : null}
              <span>{l.label}</span>
              {l.badge ? <span className="ml-auto text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded">{l.badge}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">Signed in as</div>
          <div className="text-sm text-white truncate">{user?.full_name || user?.username}</div>
          <div className="text-xs text-slate-500 mb-2">{user?.email}</div>
          <Button variant="outline" className="w-full bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white" onClick={logout} data-testid="dashboard-logout-btn">
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 h-14 flex items-center justify-between">
          <button onClick={() => setOpen(true)} data-testid="mobile-sidebar-toggle"><Menu /></button>
          <div className="font-display font-bold">MyTown · {title}</div>
          <div className="w-6" />
        </div>
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
