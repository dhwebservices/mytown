export async function onRequestPost(context) {
  try {
    const resendApiKey = context.env.RESEND_API_KEY;
    const fromEmail = context.env.RESEND_FROM_EMAIL;
    const secret = context.env.EMAIL_WORKER_SECRET;

    if (!resendApiKey || !fromEmail) {
      return Response.json({ error: "Email worker is not configured." }, { status: 500 });
    }

    const authHeader = context.request.headers.get("x-email-worker-secret");
    if (secret && authHeader !== secret) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await context.request.json();
    const to = Array.isArray(body?.to) ? body.to : [body?.to].filter(Boolean);
    const subject = String(body?.subject || "").trim();
    const html = String(body?.html || "").trim();
    const text = String(body?.text || "").trim();

    if (!to.length || !subject || (!html && !text)) {
      return Response.json({ error: "Missing email payload." }, { status: 400 });
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to,
        subject,
        html: html || undefined,
        text: text || undefined,
      }),
    });

    const result = await resendResponse.json();
    if (!resendResponse.ok) {
      return Response.json({ error: result?.message || "Resend send failed.", details: result }, { status: resendResponse.status });
    }

    return Response.json({ ok: true, id: result?.id || null });
  } catch (error) {
    return Response.json({ error: error?.message || "Unexpected email worker failure." }, { status: 500 });
  }
}
