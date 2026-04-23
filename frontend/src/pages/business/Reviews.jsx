import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import EmptyState from "@/components/EmptyState";
import { Star } from "lucide-react";

export default function BusinessReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/businesses/mine").then(async ({ data }) => {
      if (!data.length) return setLoading(false);
      const r = await api.get(`/businesses/${data[0].id}/reviews`);
      setReviews(r.data); setLoading(false);
    });
  }, []);
  return (
    <div data-testid="business-reviews">
      <h1 className="font-display text-3xl font-semibold">Reviews</h1>
      <div className="mt-6">
        {loading ? <div className="text-slate-500">Loading…</div> : reviews.length === 0 ? (
          <EmptyState icon={Star} title="No reviews yet" description="After completed bookings, customers can leave reviews. They'll show here." testid="business-reviews-empty" />
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
