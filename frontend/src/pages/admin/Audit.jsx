import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminAudit() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/admin/audit-logs").then((r) => setRows(r.data)); }, []);
  return (
    <div data-testid="admin-audit">
      <h1 className="font-display text-3xl font-semibold mb-5">Audit logs</h1>
      <ul className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg">
        {rows.map((r) => (
          <li key={r.id} className="p-3 flex justify-between text-sm">
            <div><span className="font-medium">{r.action}</span> <span className="text-slate-500">{r.target}</span></div>
            <div className="text-slate-400">{new Date(r.at).toLocaleString()}</div>
          </li>
        ))}
        {rows.length === 0 && <li className="p-6 text-center text-slate-500">No activity yet.</li>}
      </ul>
    </div>
  );
}
