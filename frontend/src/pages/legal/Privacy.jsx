function Page({ title, children, testid }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose prose-slate" data-testid={testid}>
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Legal</div>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-8 space-y-4 text-slate-700 leading-relaxed">{children}</div>
    </div>
  );
}

export default function Privacy() {
  return (
    <Page title="Privacy policy" testid="privacy-page">
      <p>This is the MyTown beta privacy policy. DH Website Services Ltd (“we”) collects only the data necessary to operate the platform: your name, email, username, phone (optional), and content you post as a business or customer.</p>
      <p>We do not sell personal data. We use industry-standard security practices. Email communications are limited to account-related events (password resets, booking notifications).</p>
      <p>For subject access, correction, or deletion requests, contact us via the <a href="/contact">contact page</a>.</p>
      <p><em>This is a beta policy. A full policy will be published at public launch.</em></p>
    </Page>
  );
}
