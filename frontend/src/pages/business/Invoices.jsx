import { useEffect, useState } from "react";
import { api, unwrapList } from "@/lib/api";
import EmptyState from "@/components/EmptyState";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BusinessInvoices() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/my-invoices").then((r) => setRows(unwrapList(r.data))).catch(() => setRows([])).finally(() => setLoading(false)); }, []);

  return (
    <div data-testid="business-invoices">
      <h1 className="font-display text-3xl font-semibold">Invoices</h1>
      <p className="mt-2 text-slate-600">MyTown never charges you for bookings. Any invoices here are for optional services (advertising, coming soon).</p>
      <div className="mt-6">
        {loading ? <div className="text-slate-500">Loading…</div> : rows.length === 0 ? (
          <EmptyState icon={FileText} title="No invoices" description="You haven't been charged for anything. You won't be charged unless you opt into paid promotion." testid="business-invoices-empty" />
        ) : (
          <ul className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg">
            {rows.map((i) => (
              <li key={i.id} className="p-4 flex justify-between">
                <div>
                  <div className="font-medium">{i.number}</div>
                  <div className="text-sm text-slate-500">{i.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">£{i.amount.toFixed(2)}</div>
                  <Badge className="mt-1">{i.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
