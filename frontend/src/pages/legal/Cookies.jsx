export default function Cookies() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="cookies-page">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Legal</div>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Cookies</h1>
      <div className="mt-8 space-y-4 text-slate-700 leading-relaxed">
        <p>MyTown uses strictly necessary cookies and local storage to keep you signed in. We do not use tracking or advertising cookies during beta.</p>
        <p>If we introduce analytics in future, you will be asked to consent first.</p>
      </div>
    </div>
  );
}
