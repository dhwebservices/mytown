import { Link, NavLink } from "react-router-dom";
import { useAuth, roleHome } from "../lib/auth";
import { Button } from "./ui/button";
import { Menu, X, MapPin } from "lucide-react";
import { useState } from "react";

const publicLinks = [
  { to: "/browse", label: "Browse" },
  { to: "/categories", label: "Categories" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/for-business", label: "For business" },
  { to: "/about", label: "About" },
];

export default function PublicHeader() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-[hsl(48,33%,97%)]/85 backdrop-blur" data-testid="public-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2" data-testid="brand-link">
          <img src="/dh-logo-icon.png" alt="DH Website Services" className="h-9 w-9 rounded-md object-contain bg-white" />
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight text-slate-900">DH Website Services</span>
            <span className="text-xs font-medium text-slate-500">MyTown</span>
          </div>
          <span className="ml-2 hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 border border-slate-200 rounded-full px-2 py-0.5">
            <MapPin className="h-3 w-3" /> Pontypridd beta
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {publicLinks.map((l) => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-900"}`
              }
              data-testid={`nav-${l.to.slice(1)}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              <Link to={roleHome(user.role)}>
                <Button variant="outline" data-testid="header-dashboard-btn">Dashboard</Button>
              </Link>
              <Button variant="ghost" onClick={logout} data-testid="header-logout-btn">Sign out</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" data-testid="header-login-btn">Sign in</Button></Link>
              <Link to="/register"><Button className="bg-amber-600 hover:bg-amber-700" data-testid="header-join-btn">Join MyTown</Button></Link>
            </>
          )}
        </div>

        <button className="lg:hidden p-2" onClick={() => setOpen(!open)} data-testid="mobile-menu-toggle">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3" data-testid="mobile-menu">
          {publicLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-sm font-medium text-slate-700">
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-200 flex gap-2">
            {user ? (
              <>
                <Link to={roleHome(user.role)} className="flex-1" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">Dashboard</Button>
                </Link>
                <Button variant="ghost" onClick={() => { logout(); setOpen(false); }}>Sign out</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex-1" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">Sign in</Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700">Join</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
