import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, roleHome } from "@/lib/auth";
import AuthShell from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    role: "customer", email: "", username: "", password: "", full_name: "", phone: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await register(form);
      if (result.activeSession) {
        toast.success("Account created");
        nav(roleHome(result.user.role), { replace: true });
      } else {
        toast.success("Account created. Check your email to confirm your account.");
        nav("/login", { replace: true });
      }
    } catch (err) {
      toast.error(err?.message || err?.response?.data?.detail || "Registration failed");
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <AuthShell title="Join MyTown" subtitle="Create your account — customer or business." testid="register-page">
      <div className="flex gap-2 mb-5 p-1 bg-slate-100 rounded-md" role="tablist">
        <button type="button" onClick={() => setForm({ ...form, role: "customer" })}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${form.role === "customer" ? "bg-white shadow text-slate-900" : "text-slate-600"}`}
          data-testid="register-tab-customer"
        >I'm a customer</button>
        <button type="button" onClick={() => setForm({ ...form, role: "business" })}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${form.role === "business" ? "bg-white shadow text-slate-900" : "text-slate-600"}`}
          data-testid="register-tab-business"
        >I'm a business</button>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" required value={form.full_name} onChange={set("full_name")} data-testid="register-fullname" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={set("email")} data-testid="register-email" />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" required minLength={3} value={form.username} onChange={set("username")} data-testid="register-username" />
          </div>
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" value={form.phone} onChange={set("phone")} data-testid="register-phone" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={6} value={form.password} onChange={set("password")} data-testid="register-password" />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700" data-testid="register-submit">{loading ? "Creating…" : "Create account"}</Button>
      </form>
      <p className="mt-6 text-sm text-slate-600">Already have an account? <Link to="/login" className="font-medium text-slate-900 underline">Sign in</Link></p>
    </AuthShell>
  );
}
