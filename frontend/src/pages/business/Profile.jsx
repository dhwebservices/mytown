import { useEffect, useState } from "react";
import { api, unwrapList } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/EmptyState";
import { Briefcase } from "lucide-react";
import { toast } from "sonner";

export default function BusinessProfile() {
  const [biz, setBiz] = useState(null);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", category_slug: "", phone: "", email: "",
    address: "", postcode: "", coverage_area: "Pontypridd", emergency_callout: false, price_from: "",
  });

  useEffect(() => {
    Promise.all([api.get("/businesses/mine"), api.get("/categories")]).then(([b, c]) => {
      const businessRows = unwrapList(b.data);
      setCats(unwrapList(c.data));
      if (businessRows.length > 0) {
        const bz = businessRows[0];
        setBiz(bz);
        setForm({
          name: bz.name || "", description: bz.description || "", category_slug: bz.category_slug || "",
          phone: bz.phone || "", email: bz.email || "", address: bz.address || "", postcode: bz.postcode || "",
          coverage_area: bz.coverage_area || "Pontypridd", emergency_callout: !!bz.emergency_callout,
          price_from: bz.price_from || "",
        });
      }
    }).catch(() => {
      setCats([]);
      setBiz(null);
    }).finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, price_from: form.price_from ? Number(form.price_from) : null };
      if (biz) {
        const { data } = await api.put(`/businesses/${biz.id}`, payload);
        setBiz(data); toast.success("Saved");
      } else {
        const { data } = await api.post("/businesses", payload);
        setBiz(data); toast.success("Listing created — save as draft, then publish when ready.");
      }
    } catch (err) { toast.error(err?.response?.data?.detail || "Save failed"); }
    finally { setSaving(false); }
  };

  const publish = async () => {
    try { const { data } = await api.post(`/businesses/${biz.id}/publish`); setBiz(data); toast.success("Submitted for review"); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };
  const unpublish = async () => {
    try { const { data } = await api.post(`/businesses/${biz.id}/unpublish`); setBiz(data); toast.info("Listing paused"); }
    catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };

  if (loading) return <div className="text-slate-500">Loading…</div>;

  if (!biz) {
    return (
      <div data-testid="business-profile-empty">
        <h1 className="font-display text-3xl font-semibold">Create your listing</h1>
        <p className="mt-2 text-slate-600">Welcome to MyTown. Fill in your details below to create a draft listing — you can publish when ready.</p>
        <ProfileForm form={form} setForm={setForm} cats={cats} submit={submit} saving={saving} ctaLabel="Create listing" />
      </div>
    );
  }

  return (
    <div data-testid="business-profile">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Your listing</h1>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <Badge className={biz.status === "published" ? "bg-emerald-100 text-emerald-800" : biz.status === "pending" ? "bg-amber-100 text-amber-900" : "bg-slate-200 text-slate-700"}>{biz.status}</Badge>
            {biz.verified ? <Badge className="bg-emerald-100 text-emerald-800">Verified</Badge> : null}
          </div>
        </div>
        <div className="flex gap-2">
          {biz.status !== "published" && <Button onClick={publish} className="bg-amber-600 hover:bg-amber-700" data-testid="business-publish-btn">Submit for review</Button>}
          {biz.status === "published" && <Button variant="outline" onClick={unpublish} data-testid="business-unpublish-btn">Pause listing</Button>}
        </div>
      </div>
      <ProfileForm form={form} setForm={setForm} cats={cats} submit={submit} saving={saving} ctaLabel="Save changes" />
    </div>
  );
}

function ProfileForm({ form, setForm, cats, submit, saving, ctaLabel }) {
  const set = (k) => (e) => setForm({ ...form, [k]: e.target?.value ?? e });
  return (
    <form onSubmit={submit} className="mt-6 grid lg:grid-cols-2 gap-5 bg-white rounded-lg border border-slate-200 p-6">
      <div className="lg:col-span-2"><Label>Business name *</Label><Input required value={form.name} onChange={set("name")} data-testid="biz-name" /></div>
      <div className="lg:col-span-2"><Label>Description</Label><Textarea rows={4} value={form.description} onChange={set("description")} data-testid="biz-description" /></div>
      <div>
        <Label>Category</Label>
        <Select value={form.category_slug} onValueChange={(v) => setForm({ ...form, category_slug: v })}>
          <SelectTrigger data-testid="biz-category"><SelectValue placeholder="Choose…" /></SelectTrigger>
          <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label>Coverage area</Label><Input value={form.coverage_area} onChange={set("coverage_area")} data-testid="biz-coverage" /></div>
      <div><Label>Phone</Label><Input value={form.phone} onChange={set("phone")} data-testid="biz-phone" /></div>
      <div><Label>Email</Label><Input type="email" value={form.email} onChange={set("email")} data-testid="biz-email" /></div>
      <div className="lg:col-span-2"><Label>Address</Label><Input value={form.address} onChange={set("address")} data-testid="biz-address" /></div>
      <div><Label>Postcode</Label><Input value={form.postcode} onChange={set("postcode")} data-testid="biz-postcode" /></div>
      <div><Label>From price (£, optional)</Label><Input type="number" value={form.price_from} onChange={set("price_from")} data-testid="biz-priceFrom" /></div>
      <div className="flex items-center gap-3"><Switch checked={form.emergency_callout} onCheckedChange={(v) => setForm({ ...form, emergency_callout: v })} data-testid="biz-emergency" /><Label>24/7 emergency callout</Label></div>
      <div className="lg:col-span-2"><Button type="submit" disabled={saving} className="bg-slate-900 hover:bg-slate-800" data-testid="biz-save-btn">{saving ? "Saving…" : ctaLabel}</Button></div>
    </form>
  );
}
