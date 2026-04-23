import DashboardLayout from "@/components/DashboardLayout";
import { Gauge, Users, Building2, Calendar, Star, Layers, FileText, History } from "lucide-react";

export default function AdminOverview() {
  const links = [
    { to: "/admin", label: "Overview", icon: Gauge, end: true },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/businesses", label: "Businesses", icon: Building2 },
    { to: "/admin/bookings", label: "Bookings", icon: Calendar },
    { to: "/admin/reviews", label: "Reviews", icon: Star },
    { to: "/admin/categories", label: "Categories", icon: Layers },
    { to: "/admin/invoices", label: "Invoices", icon: FileText },
    { to: "/admin/audit", label: "Audit logs", icon: History },
  ];
  return <DashboardLayout title="Admin" links={links} testid="admin-dashboard" />;
}
