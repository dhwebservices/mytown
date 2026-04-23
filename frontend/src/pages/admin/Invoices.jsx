import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import EmptyState from "@/components/EmptyState";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminInvoices() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/admin/invoices").then((r) => setRows(r.data)); }, []);
  return (
    <div data-testid="admin-invoices">
      <h1 className="font-display text-3xl font-semibold mb-5">Invoices</h1>
      {rows.length === 0 ? <EmptyState icon={FileText} title="No invoices yet" description="Issue invoices manually when you charge businesses for optional promotion." testid="admin-invoices-empty" /> : (
        <ul className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg">
          {rows.map((i) => (
            <li key={i.id} className="p-4 flex justify-between">
              <div><div className="font-medium">{i.number}</div><div className="text-sm text-slate-500">{i.description}</div></div>
              <div className="text-right"><div className="font-semibold">£{i.amount.toFixed(2)}</div><Badge>{i.status}</Badge></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
