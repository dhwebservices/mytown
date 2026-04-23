import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", form);
      toast.success("Thanks — we've received your message.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch { toast.error("Something went wrong."); } finally { setSending(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="contact-page">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Contact</div>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold tracking-tight">Get in touch</h1>
      <p className="mt-4 text-slate-600">Questions, partnership ideas, or press — we'd love to hear from you.</p>
      <form onSubmit={submit} className="mt-10 space-y-5 bg-white rounded-lg border border-slate-200 p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Your name</Label>
            <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="contact-name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="contact-email" />
          </div>
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} data-testid="contact-subject" />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="contact-message" />
        </div>
        <Button type="submit" disabled={sending} className="bg-slate-900 hover:bg-slate-800" data-testid="contact-submit">{sending ? "Sending…" : "Send message"}</Button>
      </form>
    </div>
  );
}
