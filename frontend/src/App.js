import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

import PublicLayout from "@/components/PublicLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

import Home from "@/pages/Home";
import HowItWorks from "@/pages/HowItWorks";
import Browse from "@/pages/Browse";
import Categories from "@/pages/Categories";
import BusinessDetail from "@/pages/BusinessDetail";
import About from "@/pages/About";
import ForBusiness from "@/pages/ForBusiness";
import ForCustomers from "@/pages/ForCustomers";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/legal/Privacy";
import Terms from "@/pages/legal/Terms";
import Cookies from "@/pages/legal/Cookies";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

import CustomerDashboard from "@/pages/customer/CustomerDashboard";
import CustomerBookings from "@/pages/customer/Bookings";
import CustomerReviews from "@/pages/customer/Reviews";
import CustomerProfile from "@/pages/customer/Profile";

import BusinessDashboard from "@/pages/business/BusinessDashboard";
import BusinessProfile from "@/pages/business/Profile";
import BusinessServices from "@/pages/business/Services";
import BusinessAvailability from "@/pages/business/Availability";
import BusinessBookings from "@/pages/business/Bookings";
import BusinessReviews from "@/pages/business/Reviews";
import BusinessInvoices from "@/pages/business/Invoices";
import BusinessAds from "@/pages/business/Ads";

import AdminOverview from "@/pages/admin/Overview";
import AdminUsers from "@/pages/admin/Users";
import AdminBusinesses from "@/pages/admin/Businesses";
import AdminBookings from "@/pages/admin/Bookings";
import AdminReviews from "@/pages/admin/Reviews";
import AdminCategories from "@/pages/admin/Categories";
import AdminInvoices from "@/pages/admin/Invoices";
import AdminAudit from "@/pages/admin/Audit";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:slug" element={<Browse />} />
            <Route path="/business/:id" element={<BusinessDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/for-business" element={<ForBusiness />} />
            <Route path="/for-customers" element={<ForCustomers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute roles={["customer"]} />}>
            <Route element={<CustomerDashboard />}>
              <Route path="/account" element={<CustomerBookings />} />
              <Route path="/account/reviews" element={<CustomerReviews />} />
              <Route path="/account/profile" element={<CustomerProfile />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={["business"]} />}>
            <Route element={<BusinessDashboard />}>
              <Route path="/business" element={<BusinessProfile />} />
              <Route path="/business/services" element={<BusinessServices />} />
              <Route path="/business/availability" element={<BusinessAvailability />} />
              <Route path="/business/bookings" element={<BusinessBookings />} />
              <Route path="/business/reviews" element={<BusinessReviews />} />
              <Route path="/business/invoices" element={<BusinessInvoices />} />
              <Route path="/business/ads" element={<BusinessAds />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={["manager"]} />}>
            <Route element={<AdminOverview />}>
              <Route path="/admin" element={<AdminUsers initial="overview" />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/businesses" element={<AdminBusinesses />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/invoices" element={<AdminInvoices />} />
              <Route path="/admin/audit" element={<AdminAudit />} />
            </Route>
          </Route>
        </Routes>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}
