import { useAuth } from "@/lib/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function CustomerProfile() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div data-testid="customer-profile">
      <h1 className="font-display text-3xl font-semibold">Profile</h1>
      <div className="mt-6 max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div><Label>Full name</Label><Input value={user.full_name || ""} readOnly /></div>
        <div><Label>Email</Label><Input value={user.email} readOnly /></div>
        <div><Label>Username</Label><Input value={user.username} readOnly /></div>
        <div><Label>Phone</Label><Input value={user.phone || ""} readOnly /></div>
        <p className="text-xs text-slate-500">Profile editing will be available soon. To update your details during beta, contact support.</p>
      </div>
    </div>
  );
}
