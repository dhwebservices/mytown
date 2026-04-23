import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/EmptyState";
import { Inbox } from "lucide-react";
import { toast } from "sonner";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  reschedule_requested: "bg-blue-100 text-blue-800",
  cancelled: "bg-slate-200 text-slate-700",
  completed: "bg-slate-900 text-white",
  no_show: "bg-red-100 text-red-800",
};

const NEXT_ACTIONS = {
  pending: ["confirmed", "rejected"],
  confirmed: ["completed", "cancelled", "no_show"],
  reschedule_requested: ["confirmed", "rejected"],
};

export default function BusinessBookings() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => api.get("/bookings/mine").then((r) => setRows(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const change = async (id, status) => {
    try { await api.patch(`/bookings/${id}/status`, { status }); toast.success("Updated"); load(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };

  return (
    <div data-testid="business-bookings">
      <h1 className="font-display text-3xl font-semibold">Bookings inbox</h1>
      <div className="mt-6">
        {loading ? <div className="text-slate-500">Loading…</div> : rows.length === 0 ? (
          <EmptyState icon={Inbox} title="No booking requests yet" description="When a customer books, requests appear here for you to accept or decline." testid="business-bookings-empty" />
        ) : (
          <ul className="space-y-3">
            {rows.map((b) => (
              <li key={b.id} className="rounded-lg border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between" data-testid={`biz-booking-${b.id}`}>
                <div>
                  <div className="font-medium">{b.service_name || "Service request"}</div>
                  <div className="text-sm text-slate-500">{new Date(b.start_at).toLocaleString()} · {b.duration_minutes}m</div>
                  {b.notes && <div className="text-xs text-slate-400 mt-1">Note: {b.notes}</div>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={STATUS_STYLES[b.status]}>{b.status.replace("_"," ")}</Badge>
                  {(NEXT_ACTIONS[b.status] || []).map((s) => (
                    <Button key={s} size="sm" variant={s === "confirmed" ? "default" : "outline"}
                      className={s === "confirmed" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                      onClick={() => change(b.id, s)} data-testid={`biz-booking-${b.id}-${s}`}>
                      {s.replace("_"," ")}
                    </Button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
