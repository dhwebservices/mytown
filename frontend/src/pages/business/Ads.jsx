import { Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BusinessAds() {
  return (
    <div data-testid="business-ads">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="font-display text-3xl font-semibold">Promote your business</h1>
        <Badge className="bg-amber-100 text-amber-900">Coming soon</Badge>
      </div>
      <p className="text-slate-600">Paid promotion options will appear here once enabled:</p>
      <ul className="mt-6 grid sm:grid-cols-3 gap-4">
        {[
          { t: "Featured on homepage", d: "Appear in the curated homepage section seen by all Pontypridd visitors." },
          { t: "Top of category", d: "Take the top slot in your category listings." },
          { t: "Top of search", d: "Be the first result when customers search in your area." },
        ].map((x) => (
          <li key={x.t} className="rounded-lg border-2 border-dashed border-slate-300 bg-white/60 p-6 text-center opacity-75">
            <Megaphone className="mx-auto h-6 w-6 text-slate-400" />
            <div className="mt-3 font-display font-semibold">{x.t}</div>
            <div className="mt-1 text-sm text-slate-500">{x.d}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
