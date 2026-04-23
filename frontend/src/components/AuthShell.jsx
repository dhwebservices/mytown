import { Link } from "react-router-dom";

export default function AuthShell({ title, subtitle, children, testid }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2" data-testid={testid}>
      <div className="flex items-center justify-center px-6 py-12 lg:py-0 bg-[hsl(48,33%,97%)]">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white font-display font-bold">M</span>
            <span className="font-display text-xl font-bold">MyTown</span>
          </Link>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-2 text-slate-600">{subtitle}</p> : null}
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="hidden lg:block relative bg-slate-900">
        <img src="https://images.unsplash.com/photo-1672825454602-c915be646233?crop=entropy&cs=srgb&fm=jpg&q=85" alt="Wales" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">MyTown · Pontypridd beta</div>
          <div className="mt-2 font-display text-3xl font-semibold max-w-md">Local pros, one shared login.</div>
        </div>
      </div>
    </div>
  );
}
