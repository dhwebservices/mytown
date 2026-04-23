import { useEffect, useState } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Star, MapPin, ShieldCheck, Zap } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function Browse() {
  const [params] = useSearchParams();
  const { slug } = useParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [cats, setCats] = useState([]);
  const [activeCat, setActiveCat] = useState(slug || "");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = {};
    if (q) query.q = q;
    if (activeCat) query.category = activeCat;
    api.get("/businesses", { params: query })
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  }, [q, activeCat]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="browse-page">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Pontypridd · Beta</div>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold">Browse local businesses</h1>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services…" className="pl-9" data-testid="browse-search-input" />
        </form>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" data-testid="browse-filters">
        <button onClick={() => setActiveCat("")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${!activeCat ? "bg-slate-900 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
          data-testid="browse-filter-all">All</button>
        {cats.map((c) => (
          <button key={c.id} onClick={() => setActiveCat(c.slug)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeCat === c.slug ? "bg-slate-900 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
            data-testid={`browse-filter-${c.slug}`}>{c.name}</button>
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map((i) => <div key={i} className="rounded-lg border border-slate-200 bg-white h-56 animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No businesses listed yet"
            description="Pontypridd businesses are joining MyTown during our beta. If you run a local service, this is the perfect time to list."
            action={<Link to="/register"><Button className="bg-amber-600 hover:bg-amber-700" data-testid="browse-empty-register">List your business</Button></Link>}
            testid="browse-empty"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="browse-results">
            {items.map((b) => (
              <Link key={b.id} to={`/business/${b.slug || b.id}`} className="group rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all" data-testid={`business-card-${b.id}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display text-lg font-semibold text-slate-900 group-hover:text-slate-700">{b.name}</div>
                    <div className="mt-1 text-sm text-slate-500 line-clamp-2">{b.description || "Local service in Pontypridd."}</div>
                  </div>
                  {b.verified ? <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><ShieldCheck className="h-3 w-3 mr-1" />Verified</Badge> : null}
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" />{b.rating_count ? `${b.rating_avg.toFixed(1)} (${b.rating_count})` : "New"}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{b.coverage_area || "Pontypridd"}</span>
                  {b.emergency_callout ? <span className="inline-flex items-center gap-1 text-amber-700"><Zap className="h-4 w-4" />24/7</span> : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
