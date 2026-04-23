import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import AuthShell from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPassword() {
  const { updatePasswordWithRecovery } = useAuth();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const token = hashParams.get("access_token") || "";

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await updatePasswordWithRecovery(token, password);
      toast.success("Password updated");
      nav("/login");
    } catch (err) { toast.error(err?.message || err?.response?.data?.detail || "Failed"); }
    finally { setLoading(false); }
  };
  return (
    <AuthShell title="Choose a new password" testid="reset-page">
      {!token ? (
        <div className="text-sm text-red-700" data-testid="reset-no-token">Missing reset token. Please use the link from your email.</div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div><Label htmlFor="password">New password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} data-testid="reset-password" /></div>
          <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800" data-testid="reset-submit">{loading ? "Updating…" : "Update password"}</Button>
        </form>
      )}
      <p className="mt-6 text-sm text-slate-600"><Link to="/login" className="underline text-slate-900">Back to sign in</Link></p>
    </AuthShell>
  );
}
