import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/EmptyState";
import { Calendar } from "lucide-react";

export default function AdminBookings() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/admin/bookings").then((r) => setRows(r.data)); }, []);
  return (
    <div data-testid="admin-bookings">
      <h1 className="font-display text-3xl font-semibold mb-5">All bookings</h1>
      {rows.length === 0 ? <EmptyState icon={Calendar} title="No bookings yet" description="Customer bookings will appear here once they start using the platform." testid="admin-bookings-empty" /> : (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500"><tr><th className="text-left p-3">When</th><th className="text-left p-3">Service</th><th className="text-left p-3">Status</th></tr></thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-t border-slate-100">
                  <td className="p-3">{new Date(b.start_at).toLocaleString()}</td>
                  <td className="p-3">{b.service_name || "Service"}</td>
                  <td className="p-3"><Badge>{b.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
