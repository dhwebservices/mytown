import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, roleHome } from "@/lib/auth";
import AuthShell from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(identifier, password);
      toast.success("Welcome back");
      const to = location.state?.from || roleHome(user.role);
      nav(to, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <AuthShell title="Sign in to MyTown" subtitle="One login for customers, businesses and staff." testid="login-page">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="identifier">Email or username</Label>
          <Input id="identifier" required autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} data-testid="login-identifier" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-slate-500 hover:text-slate-900">Forgot?</Link>
          </div>
          <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="login-password" />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800" data-testid="login-submit">{loading ? "Signing in…" : "Sign in"}</Button>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        New to MyTown? <Link to="/register" className="font-medium text-slate-900 underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}
