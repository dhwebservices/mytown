import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const IMG = "https://images.unsplash.com/photo-1672825454602-c915be646233?crop=entropy&cs=srgb&fm=jpg&q=85";

export default function ForCustomers() {
  return (
    <div data-testid="for-customers-page">
      <section className="relative">
        <img src={IMG} alt="Local street" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-white">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">For customers</div>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold leading-tight">Local pros. Real reviews. No hassle.</h1>
            <p className="mt-4 text-slate-200 max-w-xl">Book plumbers, electricians, painters and more — all based in Pontypridd.</p>
            <div className="mt-8 flex gap-3">
              <Link to="/register"><Button className="bg-amber-600 hover:bg-amber-700" data-testid="fc-register-btn">Create free account</Button></Link>
              <Link to="/browse"><Button variant="outline" className="bg-transparent text-white border-white/40 hover:bg-white hover:text-slate-900">Browse now</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-3 gap-6">
        {[
          { t: "Free to use", d: "Customer accounts are 100% free. MyTown earns nothing from your bookings." },
          { t: "Verified businesses", d: "We check every business before they're published. Trust is non-negotiable." },
          { t: "Book in minutes", d: "Pick a date and time, send the request, and the business replies directly." },
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
