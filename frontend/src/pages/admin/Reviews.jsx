import { useEffect, useState } from "react";
import { api, unwrapList } from "@/lib/api";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";
import { Star } from "lucide-react";

export default function AdminReviews() {
  const [rows, setRows] = useState([]);
  const load = () => api.get("/admin/reviews").then((r) => setRows(unwrapList(r.data))).catch(() => setRows([]));
  useEffect(() => { load(); }, []);

  const toggle = async (r) => {
    if (r.hidden) await api.post(`/admin/reviews/${r.id}/unhide`);
    else await api.post(`/admin/reviews/${r.id}/hide`);
    load();
  };

  return (
    <div data-testid="admin-reviews">
      <h1 className="font-display text-3xl font-semibold mb-5">Reviews</h1>
      {rows.length === 0 ? <EmptyState icon={Star} title="No reviews yet" testid="admin-reviews-empty" /> : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-lg border border-slate-200 bg-white p-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1 text-amber-500">{[1,2,3,4,5].map((i) => <Star key={i} className="h-4 w-4" fill={i <= r.rating ? "currentColor" : "none"} />)}</div>
                <div className="mt-1 text-slate-700">{r.comment}</div>
                <div className="text-xs text-slate-400 mt-1">{new Date(r.created_at).toLocaleDateString()} {r.hidden ? "· hidden" : ""}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => toggle(r)}>{r.hidden ? "Unhide" : "Hide"}</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
