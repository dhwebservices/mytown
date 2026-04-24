import { useEffect, useState } from "react";
import { api, unwrapList } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminBusinesses() {
  const [rows, setRows] = useState([]);
  const load = () => api.get("/admin/businesses").then((r) => setRows(unwrapList(r.data))).catch(() => setRows([]));
  useEffect(() => { load(); }, []);

  const approve = async (id) => { await api.post(`/admin/businesses/${id}/approve`); toast.success("Approved"); load(); };
  const reject = async (id) => { await api.post(`/admin/businesses/${id}/reject`); toast.info("Rejected"); load(); };
  const toggleFeatured = async (b) => { await api.patch(`/admin/businesses/${b.id}`, { featured: !b.featured }); load(); };

  return (
    <div data-testid="admin-businesses">
      <h1 className="font-display text-3xl font-semibold mb-5">Businesses</h1>
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="text-left p-3">Name</th><th className="text-left p-3">Category</th><th className="text-left p-3">Status</th><th className="text-left p-3">Rating</th><th className="text-right p-3">Actions</th></tr></thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-t border-slate-100">
                <td className="p-3"><div className="font-medium">{b.name}</div><div className="text-xs text-slate-500">{b.address}</div></td>
                <td className="p-3">{b.category_slug || "—"}</td>
                <td className="p-3 space-x-1"><Badge>{b.status}</Badge>{b.verified && <Badge className="bg-emerald-100 text-emerald-800">Verified</Badge>}{b.featured && <Badge className="bg-amber-100 text-amber-900">Featured</Badge>}</td>
                <td className="p-3">{b.rating_count ? `${b.rating_avg.toFixed(1)} (${b.rating_count})` : "—"}</td>
                <td className="p-3 text-right space-x-2">
                  {b.status === "pending" && <>
                    <Button size="sm" onClick={() => approve(b.id)} className="bg-emerald-600 hover:bg-emerald-700">Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => reject(b.id)}>Reject</Button>
                  </>}
                  {b.status === "published" && <Button size="sm" variant="outline" onClick={() => toggleFeatured(b)}>{b.featured ? "Unfeature" : "Feature"}</Button>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-slate-500">No businesses yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
