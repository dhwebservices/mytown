import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Step = ({ n, t, d }) => (
  <div className="flex gap-5 rounded-lg border border-slate-200 bg-white p-6">
    <div className="text-amber-600 font-display text-3xl font-bold w-12 flex-shrink-0">{n}</div>
    <div>
      <div className="font-display text-lg font-semibold">{t}</div>
      <p className="mt-2 text-sm text-slate-600">{d}</p>
    </div>
  </div>
);

export default function HowItWorks() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="how-page">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Getting started</div>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold tracking-tight">How MyTown works</h1>
      <p className="mt-4 text-slate-600 max-w-2xl">A simple, local-first marketplace. No commission. No middlemen. Just Pontypridd residents and local businesses getting work done.</p>

      <div className="mt-12 grid lg:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display text-2xl font-semibold mb-5">For customers</h2>
          <div className="space-y-4">
            <Step n="01" t="Create a free account" d="Sign up in a minute. Your details stay private until you choose to book." />
            <Step n="02" t="Search & compare" d="Filter by category, rating, and emergency availability. See real reviews from Pontypridd neighbours." />
            <Step n="03" t="Request a booking" d="Pick a date and time. The business confirms, reschedules, or responds quickly." />
            <Step n="04" t="Get it done, then review" d="After the work is completed, leave a review to help the next customer." />
          </div>
          <Link to="/register" className="inline-block mt-6"><Button className="bg-slate-900 hover:bg-slate-800" data-testid="how-customer-cta">Create a customer account</Button></Link>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold mb-5">For businesses</h2>
          <div className="space-y-4">
            <Step n="01" t="Register & create your listing" d="Add your name, services, opening hours, and coverage area. Save as draft until ready." />
            <Step n="02" t="Get approved" d="Our team verifies your details to keep MyTown trustworthy." />
            <Step n="03" t="Receive bookings" d="Customers request times. You confirm, reschedule, or reject in your dashboard." />
            <Step n="04" t="Keep 100% of your revenue" d="MyTown doesn't take a cut. Optional ads and featured placements (coming soon)." />
          </div>
          <Link to="/register" className="inline-block mt-6"><Button className="bg-amber-600 hover:bg-amber-700" data-testid="how-business-cta">List your business</Button></Link>
        </div>
      </div>
    </div>
  );
}
