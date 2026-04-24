import { useEffect, useState } from "react";
import { api, unwrapList } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import EmptyState from "@/components/EmptyState";
import { Calendar, Star } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  reschedule_requested: "bg-blue-100 text-blue-800",
  cancelled: "bg-slate-200 text-slate-700",
  completed: "bg-slate-900 text-white",
  no_show: "bg-red-100 text-red-800",
};

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const load = () => api.get("/bookings/mine").then((r) => setBookings(unwrapList(r.data))).catch(() => setBookings([])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    try { await api.patch(`/bookings/${id}/status`, { status: "cancelled" }); toast.success("Cancelled"); load(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };

  const submitReview = async () => {
    try {
      await api.post("/reviews", { booking_id: reviewing.id, rating, comment });
      toast.success("Review submitted");
      setReviewing(null); setRating(5); setComment(""); load();
    } catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };

  return (
    <div data-testid="customer-bookings">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Customer</div>
          <h1 className="font-display text-3xl font-semibold">My bookings</h1>
        </div>
        <Link to="/browse"><Button className="bg-amber-600 hover:bg-amber-700" data-testid="customer-book-new">Book new service</Button></Link>
      </div>

      {loading ? <div className="text-slate-500">Loading…</div> : bookings.length === 0 ? (
        <EmptyState icon={Calendar} title="No bookings yet" description="Browse Pontypridd businesses and send your first booking request."
          action={<Link to="/browse"><Button className="bg-slate-900 hover:bg-slate-800">Browse businesses</Button></Link>}
          testid="customer-bookings-empty" />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-lg border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between" data-testid={`booking-row-${b.id}`}>
              <div>
                <div className="font-medium">{b.service_name || "Service"}</div>
                <div className="text-sm text-slate-500">{new Date(b.start_at).toLocaleString()} · {b.duration_minutes}m</div>
                {b.notes && <div className="text-xs text-slate-400 mt-1">Note: {b.notes}</div>}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={STATUS_STYLES[b.status]}>{b.status.replace("_"," ")}</Badge>
                {b.status === "completed" && <Button size="sm" variant="outline" onClick={() => setReviewing(b)} data-testid={`review-btn-${b.id}`}><Star className="h-4 w-4 mr-1" />Review</Button>}
                {["pending","confirmed","reschedule_requested"].includes(b.status) && <Button size="sm" variant="ghost" onClick={() => cancel(b.id)} data-testid={`cancel-btn-${b.id}`}>Cancel</Button>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!reviewing} onOpenChange={(o) => !o && setReviewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Leave a review</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)} data-testid={`star-${n}`}>
                    <Star className={`h-6 w-6 ${n <= rating ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Comment</Label>
              <Textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} data-testid="review-comment" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewing(null)}>Cancel</Button>
            <Button onClick={submitReview} className="bg-slate-900 hover:bg-slate-800" data-testid="review-submit">Submit review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
