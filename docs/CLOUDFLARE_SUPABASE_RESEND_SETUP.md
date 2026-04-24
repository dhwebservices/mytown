## Cloudflare Pages

Add these environment variables to the `frontend` Pages project:

- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `EMAIL_WORKER_SECRET`

Use these build settings:

- Framework preset: `React (Static)`
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `build`

## Supabase Auth + Resend

Email verification and password reset emails should be sent by Supabase Auth through custom SMTP, not by the Cloudflare worker.

In Supabase:

1. Open `Authentication` -> `Providers` / `Settings` -> `SMTP Settings`.
2. Enable custom SMTP.
3. Add your Resend SMTP credentials there.
4. Set the sender address to the same verified sender/domain you use in Resend.
5. Set the site URL / redirect URL to your live Pages domain.

This makes signup verification and password recovery emails come from Resend while still being handled by Supabase Auth.

## Cloudflare Email Worker

The repo now includes a Pages Function email worker:

- `frontend/functions/api/send-email.js`

Route:

- `POST /api/send-email`

Headers:

- `x-email-worker-secret: <EMAIL_WORKER_SECRET>`

JSON body:

```json
{
  "to": ["person@example.com"],
  "subject": "Subject",
  "html": "<p>Hello</p>",
  "text": "Hello"
}
```

Use this worker for app-side transactional emails later.
Do not use it for Supabase auth verification emails.
