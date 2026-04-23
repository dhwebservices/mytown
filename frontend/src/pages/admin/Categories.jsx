import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminCategories() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ slug: "", name: "", description: "", icon: "" });
  const load = () => api.get("/categories").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try { await api.post("/categories", { ...form, active: true }); setForm({ slug: "", name: "", description: "", icon: "" }); toast.success("Added"); load(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };
  const remove = async (id) => { await api.delete(`/categories/${id}`); load(); };

  return (
    <div data-testid="admin-categories">
      <h1 className="font-display text-3xl font-semibold mb-5">Categories</h1>
      <form onSubmit={add} className="grid sm:grid-cols-5 gap-3 bg-white rounded-lg border border-slate-200 p-5 items-end mb-6">
        <div><Label>Slug</Label><Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
        <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="sm:col-span-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div><Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800">Add</Button></div>
      </form>
      <ul className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg">
        {rows.map((c) => (
          <li key={c.id} className="p-4 flex justify-between">
            <div><div className="font-medium">{c.name}</div><div className="text-sm text-slate-500">/{c.slug} · {c.description}</div></div>
            <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>Disable</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
