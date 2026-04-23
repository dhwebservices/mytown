import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Phone, Mail, ShieldCheck, Zap, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const TIME_SLOTS = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

export default function BusinessDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [biz, setBiz] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState();
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/businesses/${id}`).then(async (r) => {
      setBiz(r.data);
      const [sv, rv] = await Promise.all([
        api.get(`/businesses/${r.data.id}/services`),
        api.get(`/businesses/${r.data.id}/reviews`),
      ]);
      setServices(sv.data);
      setReviews(rv.data);
    }).catch(() => setBiz(null)).finally(() => setLoading(false));
  }, [id]);

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!user) { nav("/login", { state: { from: `/business/${id}` } }); return; }
    if (user.role !== "customer") { toast.error("Only customer accounts can book."); return; }
    if (!date) { toast.error("Pick a date"); return; }
    setSubmitting(true);
    try {
      const dt = new Date(date);
      const [h, m] = time.split(":").map(Number);
      dt.setHours(h, m, 0, 0);
      const payload = {
        business_id: biz.id,
        service_id: serviceId || null,
        start_at: dt.toISOString(),
        duration_minutes: services.find((s) => s.id === serviceId)?.duration_minutes || 60,
        notes: notes || null,
      };
      await api.post("/bookings", payload);
      toast.success("Booking request sent!");
      nav("/account");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Booking failed");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="max-w-7xl mx-auto p-12 text-slate-500">Loading…</div>;
  if (!biz) return <div className="max-w-7xl mx-auto p-12 text-slate-500">Business not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="business-detail">
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold">{biz.name}</h1>
                <div className="mt-2 flex items-center flex-wrap gap-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" />{biz.rating_count ? `${biz.rating_avg.toFixed(1)} (${biz.rating_count} reviews)` : "No reviews yet"}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{biz.coverage_area}</span>
                  {biz.emergency_callout && <span className="inline-flex items-center gap-1 text-amber-700"><Zap className="h-4 w-4" />24/7 emergency</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {biz.verified && <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><ShieldCheck className="h-3 w-3 mr-1" />Verified</Badge>}
                {biz.featured && <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">Featured</Badge>}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="font-display text-xl font-semibold mb-2">About</h2>
            <p className="text-slate-600 whitespace-pre-line">{biz.description || "No description provided."}</p>
            <div className="mt-5 grid sm:grid-cols-2 gap-4 text-sm">
              {biz.phone && <div className="inline-flex items-center gap-2 text-slate-700"><Phone className="h-4 w-4" />{biz.phone}</div>}
              {biz.email && <div className="inline-flex items-center gap-2 text-slate-700"><Mail className="h-4 w-4" />{biz.email}</div>}
              {biz.address && <div className="inline-flex items-center gap-2 text-slate-700"><MapPin className="h-4 w-4" />{biz.address}</div>}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Services</h2>
            {services.length === 0 ? (
              <div className="text-slate-500 text-sm">No services listed yet.</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {services.map((s) => (
                  <li key={s.id} className="py-3 flex items-start justify-between">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-slate-500">{s.description}</div>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <div className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{s.duration_minutes} min</div>
                      {s.price_guidance && <div className="text-slate-500 mt-1">{s.price_guidance}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Reviews</h2>
            {reviews.length === 0 ? (
              <div className="text-slate-500 text-sm">No reviews yet. Be the first to book and leave one.</div>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="border-b border-slate-100 pb-4 last:border-0">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1,2,3,4,5].map((i) => <Star key={i} className="h-4 w-4" fill={i <= r.rating ? "currentColor" : "none"} />)}
                    </div>
                    <div className="mt-1 text-slate-700">{r.comment}</div>
                    <div className="mt-1 text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="lg:col-span-1">
          <form onSubmit={submitBooking} className="rounded-lg border border-slate-200 bg-white p-6 sticky top-24" data-testid="booking-widget">
            <h3 className="font-display text-lg font-semibold">Book a service</h3>
            <p className="text-sm text-slate-500 mt-1">MyTown takes no booking fee. The business confirms directly.</p>

            <div className="mt-5 space-y-4">
              <div>
                <Label>Service</Label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger data-testid="booking-service-select"><SelectValue placeholder="Choose a service (optional)" /></SelectTrigger>
                  <SelectContent>
                    {services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} · {s.duration_minutes}m</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <div className="border rounded-md p-2">
                  <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))} />
                </div>
              </div>
              <div>
                <Label>Time</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger data-testid="booking-time-select"><SelectValue /></SelectTrigger>
                  <SelectContent>{TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything the business should know?" data-testid="booking-notes" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-amber-600 hover:bg-amber-700" data-testid="booking-submit-btn">
                {submitting ? "Sending…" : user ? "Request booking" : "Sign in to book"}
              </Button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
