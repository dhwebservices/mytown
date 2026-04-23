import { useState } from "react";
import { useAuth } from "@/lib/auth";
import AuthShell from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await sendPasswordReset(email); setSent(true); }
    catch (err) { toast.error(err?.message || "Something went wrong"); } finally { setLoading(false); }
  };
  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we'll send you a reset link." testid="forgot-page">
      {sent ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" data-testid="forgot-sent">
          If an account exists for that email, a reset link has been sent. Please check your inbox.
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div><Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} data-testid="forgot-email" /></div>
          <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800" data-testid="forgot-submit">{loading ? "Sending…" : "Send reset link"}</Button>
        </form>
      )}
      <p className="mt-6 text-sm text-slate-600"><Link to="/login" className="underline text-slate-900">Back to sign in</Link></p>
    </AuthShell>
  );
}
