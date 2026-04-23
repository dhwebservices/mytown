import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-24" data-testid="public-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-amber-600 text-white font-display font-bold">M</span>
            <span className="font-display text-xl font-bold text-white">MyTown</span>
          </div>
          <p className="mt-4 text-sm text-slate-400 max-w-xs">
            A local services marketplace for Pontypridd, Wales. Built by <span className="text-slate-200">DH Website Services</span>. Beta.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">Platform</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/browse" className="hover:text-white">Browse businesses</Link></li>
            <li><Link to="/categories" className="hover:text-white">Categories</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white">How it works</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">Get started</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/for-business" className="hover:text-white">For business</Link></li>
            <li><Link to="/for-customers" className="hover:text-white">For customers</Link></li>
            <li><Link to="/register" className="hover:text-white">Create account</Link></li>
            <li><Link to="/login" className="hover:text-white">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">Company</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
            <li><Link to="/cookies" className="hover:text-white">Cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} DH Website Services Ltd. All rights reserved.</div>
          <div>Pontypridd, Wales · Beta release</div>
        </div>
      </div>
    </footer>
  );
}
