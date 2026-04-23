import DashboardLayout from "@/components/DashboardLayout";
import { Briefcase, Wrench, Calendar, Inbox, Star, FileText, Megaphone } from "lucide-react";

export default function BusinessDashboard() {
  const links = [
    { to: "/business", label: "Listing", icon: Briefcase, end: true },
    { to: "/business/services", label: "Services", icon: Wrench },
    { to: "/business/availability", label: "Availability", icon: Calendar },
    { to: "/business/bookings", label: "Bookings", icon: Inbox },
    { to: "/business/reviews", label: "Reviews", icon: Star },
    { to: "/business/invoices", label: "Invoices", icon: FileText },
    { to: "/business/ads", label: "Promote", icon: Megaphone, badge: "Soon" },
  ];
  return <DashboardLayout title="Business" links={links} testid="business-dashboard" />;
}
