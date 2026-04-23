import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HERO = "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export default function ForBusiness() {
  return (
    <div data-testid="for-business-page">
      <section className="relative">
        <img src={HERO} alt="Tradesperson" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-white">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">For local businesses</div>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold leading-tight">List your business on MyTown.</h1>
            <p className="mt-4 text-slate-200 max-w-xl">Reach Pontypridd residents searching for trusted local services. No commission on jobs. You keep every penny.</p>
            <div className="mt-8 flex gap-3">
              <Link to="/register"><Button className="bg-amber-600 hover:bg-amber-700" data-testid="fb-register-btn">Get started</Button></Link>
              <Link to="/login"><Button variant="outline" className="bg-transparent text-white border-white/40 hover:bg-white hover:text-slate-900">I have an account</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-3 gap-6">
        {[
          { t: "0% commission", d: "MyTown never takes a cut of your booking revenue — not now, not ever." },
          { t: "Local customers only", d: "Every enquiry comes from a real resident of Pontypridd and surrounding valleys." },
          { t: "Simple dashboard", d: "Manage your listing, availability, bookings, and reviews from one place." },
          { t: "Verified trust badge", d: "Pass our light-touch verification and show a trust badge on your profile." },
          { t: "Pause anytime", d: "Going on holiday? Unpublish in a click and republish when you're back." },
          { t: "Optional promotion", d: "Coming soon: featured placement and category boosting. Opt in when it suits you." },
        ].map((x) => (
          <div key={x.t} className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="font-display text-lg font-semibold">{x.t}</div>
            <p className="mt-2 text-sm text-slate-600">{x.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
