import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import EmptyState from "@/components/EmptyState";
import { Wrench, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function BusinessServices() {
  const [biz, setBiz] = useState(null);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", duration_minutes: 60, price_guidance: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/businesses/mine").then(async ({ data }) => {
      if (data.length) {
        setBiz(data[0]);
        const r = await api.get(`/businesses/${data[0].id}/services`);
        setServices(r.data);
      }
    }).finally(() => setLoading(false));
  }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/businesses/${biz.id}/services`, { ...form, duration_minutes: Number(form.duration_minutes) || 60 });
      setServices([...services, data]);
      setForm({ name: "", description: "", duration_minutes: 60, price_guidance: "" });
      toast.success("Service added");
    } catch (e) { toast.error("Failed"); }
  };

  const remove = async (id) => {
    await api.delete(`/businesses/${biz.id}/services/${id}`);
    setServices(services.filter((s) => s.id !== id));
  };

  if (loading) return <div className="text-slate-500">Loading…</div>;
  if (!biz) return <EmptyState icon={Wrench} title="Create your listing first" description="Add your business on the Listing page, then come back to add services." testid="business-services-nolist" />;

  return (
    <div data-testid="business-services">
      <h1 className="font-display text-3xl font-semibold">Services</h1>
      <form onSubmit={add} className="mt-6 grid sm:grid-cols-6 gap-3 bg-white rounded-lg border border-slate-200 p-5 items-end">
        <div className="sm:col-span-2"><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="service-name" /></div>
        <div className="sm:col-span-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="service-description" /></div>
        <div><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} data-testid="service-duration" /></div>
        <div><Label>Price guide</Label><Input placeholder="£ optional" value={form.price_guidance} onChange={(e) => setForm({ ...form, price_guidance: e.target.value })} data-testid="service-price" /></div>
        <div className="sm:col-span-6"><Button type="submit" className="bg-slate-900 hover:bg-slate-800" data-testid="service-add-btn">Add service</Button></div>
      </form>

      <div className="mt-6">
        {services.length === 0 ? (
          <EmptyState icon={Wrench} title="No services yet" description="Add at least one service so customers can book you." testid="business-services-empty" />
        ) : (
          <ul className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg">
            {services.map((s) => (
              <li key={s.id} className="p-4 flex items-center justify-between" data-testid={`service-row-${s.id}`}>
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-slate-500">{s.duration_minutes} min · {s.price_guidance || "Price on request"}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove(s.id)} data-testid={`service-delete-${s.id}`}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
