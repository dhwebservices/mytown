import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { ArrowRight } from "lucide-react";

export default function Categories() {
  const [cats, setCats] = useState([]);
  useEffect(() => { api.get("/categories").then((r) => setCats(r.data)); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="categories-page">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Explore</div>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold">Categories</h1>
      <p className="mt-3 text-slate-600 max-w-2xl">Browse by trade. All businesses listed on MyTown operate in Pontypridd and surrounding valleys.</p>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cats.map((c) => (
          <Link key={c.id} to={`/categories/${c.slug}`} className="group rounded-lg border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all" data-testid={`category-card-${c.slug}`}>
            <div className="flex items-start justify-between">
              <div className="font-display text-lg font-semibold text-slate-900">{c.name}</div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </div>
            <div className="mt-2 text-sm text-slate-500">{c.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
