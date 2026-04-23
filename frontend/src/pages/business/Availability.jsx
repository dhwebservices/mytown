import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "@/components/EmptyState";
import { Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function BusinessAvailability() {
  const [biz, setBiz] = useState(null);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ day_of_week: "0", start_time: "09:00", end_time: "17:00", slot_minutes: 60 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/businesses/mine").then(async ({ data }) => {
      if (data.length) {
        setBiz(data[0]);
        const r = await api.get(`/businesses/${data[0].id}/availability`);
        setSlots(r.data);
      }
    }).finally(() => setLoading(false));
  }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/businesses/${biz.id}/availability`, {
        day_of_week: Number(form.day_of_week),
        start_time: form.start_time,
        end_time: form.end_time,
        slot_minutes: Number(form.slot_minutes),
      });
      setSlots([...slots, data]);
      toast.success("Slot added");
    } catch { toast.error("Failed"); }
  };

  const remove = async (id) => {
    await api.delete(`/businesses/${biz.id}/availability/${id}`);
    setSlots(slots.filter((s) => s.id !== id));
  };

  if (loading) return <div className="text-slate-500">Loading…</div>;
  if (!biz) return <EmptyState icon={Calendar} title="Create your listing first" testid="business-availability-nolist" />;

  return (
    <div data-testid="business-availability">
      <h1 className="font-display text-3xl font-semibold">Availability</h1>
      <p className="mt-2 text-slate-600">Set your weekly working hours. Customers request bookings based on these.</p>

      <form onSubmit={add} className="mt-6 grid sm:grid-cols-5 gap-3 bg-white rounded-lg border border-slate-200 p-5 items-end">
        <div>
          <Label>Day</Label>
          <Select value={form.day_of_week} onValueChange={(v) => setForm({ ...form, day_of_week: v })}>
            <SelectTrigger data-testid="avail-day"><SelectValue /></SelectTrigger>
            <SelectContent>{DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Start</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} data-testid="avail-start" /></div>
        <div><Label>End</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} data-testid="avail-end" /></div>
        <div><Label>Slot (min)</Label><Input type="number" value={form.slot_minutes} onChange={(e) => setForm({ ...form, slot_minutes: e.target.value })} data-testid="avail-slot" /></div>
        <div><Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" data-testid="avail-add-btn">Add</Button></div>
      </form>

      <div className="mt-6">
        {slots.length === 0 ? <EmptyState icon={Calendar} title="No availability set" description="Add one or more weekly windows." testid="business-availability-empty" /> : (
          <ul className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg">
            {slots.map((s) => (
              <li key={s.id} className="p-4 flex items-center justify-between">
                <div><div className="font-medium">{DAYS[s.day_of_week]}</div><div className="text-sm text-slate-500">{s.start_time} – {s.end_time} · {s.slot_minutes}m slots</div></div>
                <Button size="sm" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
