import DashboardLayout from "@/components/DashboardLayout";
import { Calendar, Star, User } from "lucide-react";

export default function CustomerDashboard() {
  const links = [
    { to: "/account", label: "My bookings", icon: Calendar, end: true },
    { to: "/account/reviews", label: "My reviews", icon: Star },
    { to: "/account/profile", label: "Profile", icon: User },
  ];
  return <DashboardLayout title="Customer" links={links} testid="customer-dashboard" />;
}
