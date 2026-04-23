export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8" data-testid="about-page">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">About</div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold tracking-tight">Built locally, for Pontypridd.</h1>
      </div>
      <p className="text-lg text-slate-700 leading-relaxed">
        MyTown is a <strong>DH Website Services</strong> product. We wanted a properly local directory — somewhere you could
        find an electrician in Graig or a cleaner in Treforest without scrolling through national listings. So we built one.
      </p>
      <p className="text-slate-600 leading-relaxed">
        Our beta focuses exclusively on Pontypridd. Every business on MyTown is a real, verified local operator. We never take a cut of jobs —
        businesses only ever pay for optional advertising products once they're live (and those are currently disabled during beta).
      </p>
      <div className="grid sm:grid-cols-3 gap-4 pt-6">
        {[
          { t: "Local first", d: "Not a national franchise. Pontypridd only in beta, with plans to expand carefully." },
          { t: "Zero commission", d: "Businesses keep 100% of what they earn. MyTown never charges for jobs." },
          { t: "Trust, always", d: "Verified listings, real customer reviews, and strong moderation." },
        ].map((x) => (
          <div key={x.t} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="font-display text-lg font-semibold">{x.t}</div>
            <p className="mt-2 text-sm text-slate-600">{x.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
