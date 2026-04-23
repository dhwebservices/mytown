import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminUsers({ initial }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [form, setForm] = useState({ email: "", username: "", password: "", role: "customer", full_name: "", phone: "" });

  useEffect(() => { if (initial === "overview") api.get("/admin/stats").then((r) => setStats(r.data)); }, [initial]);
  const load = () => api.get("/admin/users", { params: { role: role || undefined, q: q || undefined } }).then((r) => setUsers(r.data));
  useEffect(() => { load(); }, [role, q]);

  const suspend = async (id) => { await api.post(`/admin/users/${id}/suspend`); load(); };
  const activate = async (id) => { await api.post(`/admin/users/${id}/activate`); load(); };
  const reset = async (id) => {
    const { data } = await api.post(`/admin/users/${id}/reset-password`);
    setResetResult(data);
  };
  const createUser = async (e) => {
    e.preventDefault();
    try { await api.post("/admin/users", form); toast.success("User created"); setCreating(false); setForm({ email: "", username: "", password: "", role: "customer", full_name: "", phone: "" }); load(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };

  return (
    <div data-testid="admin-users">
      {initial === "overview" && stats && (
        <div className="mb-10">
          <h1 className="font-display text-3xl font-semibold mb-4">Platform overview</h1>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { t: "Users", v: stats.users.total },
              { t: "Customers", v: stats.users.customers },
              { t: "Businesses", v: stats.businesses.total },
              { t: "Published", v: stats.businesses.published },
              { t: "Pending review", v: stats.businesses.pending_review },
              { t: "Bookings", v: stats.bookings.total },
              { t: "Pending bookings", v: stats.bookings.pending },
              { t: "Reviews", v: stats.reviews },
            ].map((x) => (
              <div key={x.t} className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{x.t}</div>
                <div className="mt-2 font-display text-3xl font-bold">{x.v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <h2 className="font-display text-2xl font-semibold">All users</h2>
        <div className="flex gap-2">
          <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="w-56" data-testid="admin-users-search" />
          <Select value={role || "all"} onValueChange={(v) => setRole(v === "all" ? "" : v)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
              <SelectItem value="business">Businesses</SelectItem>
              <SelectItem value="manager">Managers</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setCreating(true)} className="bg-slate-900 hover:bg-slate-800" data-testid="admin-users-create-btn">Create user</Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Role</th><th className="text-left p-3">Status</th><th className="text-right p-3">Actions</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100" data-testid={`user-row-${u.id}`}>
                <td className="p-3"><div className="font-medium">{u.full_name || u.username}</div><div className="text-xs text-slate-500">@{u.username}</div></td>
                <td className="p-3">{u.email}</td>
                <td className="p-3"><Badge variant="outline">{u.role}</Badge></td>
                <td className="p-3"><Badge className={u.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>{u.status}</Badge></td>
                <td className="p-3 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => reset(u.id)} data-testid={`user-reset-${u.id}`}>Reset pw</Button>
                  {u.status === "active"
                    ? <Button size="sm" variant="ghost" onClick={() => suspend(u.id)}>Suspend</Button>
                    : <Button size="sm" variant="ghost" onClick={() => activate(u.id)}>Activate</Button>}
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td className="p-6 text-center text-slate-500" colSpan="5">No users match your filters.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create user</DialogTitle></DialogHeader>
          <form onSubmit={createUser} className="space-y-3">
            <div><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Username</Label><Input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Password</Label><Input required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div><Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button type="submit" className="bg-slate-900 hover:bg-slate-800">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetResult} onOpenChange={(o) => !o && setResetResult(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Password reset</DialogTitle></DialogHeader>
          {resetResult && (
            <div className="space-y-3 text-sm">
              <div>Temporary password generated. You can share either:</div>
              <div className="rounded-md bg-slate-50 border border-slate-200 p-3 font-mono break-all">Temp: {resetResult.temporary_password}</div>
              <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-xs break-all">{resetResult.reset_url}</div>
              <p className="text-xs text-slate-500">Tell the user to sign in with the temp password (or open the reset link) and change it.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
