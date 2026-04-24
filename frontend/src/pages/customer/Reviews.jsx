import { useEffect, useState } from "react";
import { api, unwrapList } from "@/lib/api";
import { Star } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/reviews/mine").then((r) => setReviews(unwrapList(r.data))).catch(() => setReviews([])).finally(() => setLoading(false)); }, []);

  return (
    <div data-testid="customer-reviews">
      <h1 className="font-display text-3xl font-semibold">My reviews</h1>
      <div className="mt-6">
        {loading ? <div className="text-slate-500">Loading…</div> : reviews.length === 0 ? (
          <EmptyState icon={Star} title="No reviews yet" description="Your reviews will appear here once you rate completed bookings." testid="customer-reviews-empty" />
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-1 text-amber-500">
                  {[1,2,3,4,5].map((i) => <Star key={i} className="h-4 w-4" fill={i <= r.rating ? "currentColor" : "none"} />)}
                </div>
                <div className="mt-2 text-slate-700">{r.comment}</div>
                <div className="text-xs text-slate-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
