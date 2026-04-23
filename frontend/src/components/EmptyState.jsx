import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title, description, action, testid }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center" data-testid={testid || "empty-state"}>
      <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-lg font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
