import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, ShieldCheck, Star, Clock, ArrowRight } from "lucide-react";

const HERO_IMG = "https://images.pexels.com/photos/35402056/pexels-photo-35402056.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const TRADES_IMG = "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const TOOLS_IMG = "https://images.unsplash.com/photo-1569409612196-2a93825ea659?crop=entropy&cs=srgb&fm=jpg&q=85";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" data-testid="home-hero">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Pontypridd streets" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-2xl text-white animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-3 py-1 text-xs tracking-wide">
              <MapPin className="h-3 w-3" /> Pontypridd · Beta release
            </div>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              Local trades you can trust. <span className="text-amber-400">In your area.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-200 max-w-xl">
              MyTown connects Pontypridd residents with vetted local plumbers, electricians, decorators and more. No booking fees. No middlemen.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); window.location.href = `/browse?q=${encodeURIComponent(q)}`; }}
              className="mt-8 flex flex-col sm:flex-row gap-2 max-w-xl"
              data-testid="home-search-form"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="What do you need doing? e.g. boiler repair"
                  className="h-12 pl-9 bg-white text-slate-900 border-0"
                  data-testid="home-search-input"
                />
              </div>
              <Button type="submit" className="h-12 bg-amber-600 hover:bg-amber-700 px-6" data-testid="home-search-btn">
                Search Pontypridd
              </Button>
            </form>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-200">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-400" /> Verified local businesses</span>
              <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-amber-400" /> Real customer reviews</span>
              <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-amber-400" /> Book in minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories strip */}
      <section className="border-b border-slate-200 bg-white" data-testid="home-categories">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Popular categories</div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold mt-1">Find the right trade</h2>
            </div>
            <Link to="/categories" className="text-sm text-slate-700 hover:text-slate-900 inline-flex items-center gap-1">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 10).map((c) => (
              <Link key={c.id} to={`/categories/${c.slug}`}
                className="inline-flex items-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 transition-colors"
                data-testid={`home-category-${c.slug}`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center" data-testid="home-how">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">How MyTown works</div>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold leading-tight">
            Three steps from need to booked.
          </h2>
          <ol className="mt-8 space-y-6">
            {[
              { n: "01", t: "Browse local pros", d: "See verified businesses serving Pontypridd, with real ratings and availability." },
              { n: "02", t: "Pick a slot", d: "Choose a service, pick a date and time, and send your request in seconds." },
              { n: "03", t: "Get the job done", d: "The business confirms, turns up, and you review afterwards. That's it." },
            ].map((s) => (
              <li key={s.n} className="flex gap-5">
                <div className="text-amber-600 font-display text-2xl font-bold w-10 flex-shrink-0">{s.n}</div>
                <div>
                  <div className="font-semibold text-slate-900">{s.t}</div>
                  <div className="text-slate-600 text-sm mt-1">{s.d}</div>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex gap-3">
            <Link to="/browse"><Button className="bg-slate-900 hover:bg-slate-800" data-testid="home-browse-btn">Browse businesses</Button></Link>
            <Link to="/how-it-works"><Button variant="outline" data-testid="home-learnmore-btn">Learn more</Button></Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <img src={TRADES_IMG} alt="Trade at work" className="rounded-lg object-cover w-full h-72 lg:h-96 col-span-1" />
          <img src={TOOLS_IMG} alt="Tools" className="rounded-lg object-cover w-full h-72 lg:h-96 col-span-1 mt-10" />
        </div>
      </section>

      {/* For business CTA */}
      <section className="bg-slate-900 text-white" data-testid="home-for-business">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">For local businesses</div>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold leading-tight">
              New customers in Pontypridd. Zero commission.
            </h2>
            <p className="mt-4 text-slate-300 max-w-lg">
              List your business, manage your availability, and receive booking requests directly. MyTown never takes a cut of your jobs — we only offer optional paid placements later.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/register"><Button className="bg-amber-600 hover:bg-amber-700" data-testid="home-register-business-btn">List your business</Button></Link>
              <Link to="/for-business"><Button variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white hover:text-slate-900">Why MyTown</Button></Link>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-6">
            {[
              { k: "0%", v: "Commission on jobs" },
              { k: "Beta", v: "Early access pricing" },
              { k: "Pontypridd", v: "Serving local only" },
              { k: "Direct", v: "Customer contact" },
            ].map((x) => (
              <div key={x.v} className="rounded-lg border border-white/10 bg-white/5 p-6">
                <dt className="font-display text-3xl font-bold text-amber-400">{x.k}</dt>
                <dd className="mt-2 text-sm text-slate-300">{x.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
