// Cloudflare Pages Function: POST /api/contact
// Sends the contact form to the business inbox through the Resend API.
// Required secret (Pages → Settings → Variables and Secrets): RESEND_API_KEY
// Optional variables: CONTACT_TO (default info@pai-tech-consulting.com),
//                     CONTACT_FROM (default "PaiTech Website <website@pai-tech-consulting.com>")

const DEFAULT_TO = 'info@pai-tech-consulting.com';
const DEFAULT_FROM = 'PaiTech Website <website@pai-tech-consulting.com>';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clean(value, max) {
  return String(value || '').trim().slice(0, max);
}

function respond(request, ok, error, status) {
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  if (wantsJson) {
    return new Response(JSON.stringify(ok ? { ok: true } : { ok: false, error }), {
      status: status || (ok ? 200 : 400),
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
  // Plain HTML form post (JavaScript disabled): send the visitor back to the contact page
  const url = new URL('/contact', request.url);
  url.searchParams.set(ok ? 'sent' : 'error', '1');
  return Response.redirect(url.toString(), 303);
}

export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return respond(request, false, 'invalid_body', 400);
  }

  // Honeypot filled → silently accept so bots learn nothing
  if (clean(form.get('website'), 200)) {
    return respond(request, true);
  }

  const data = {
    name: clean(form.get('name'), 100),
    email: clean(form.get('email'), 200),
    phone: clean(form.get('phone'), 30),
    company: clean(form.get('company'), 120),
    topic: clean(form.get('topic'), 80),
    message: clean(form.get('message'), 4000),
  };

  if (!data.name || !data.message || !EMAIL_RE.test(data.email)) {
    return respond(request, false, 'missing_fields', 400);
  }

  if (!env.RESEND_API_KEY) {
    return respond(request, false, 'not_configured', 500);
  }

  const rows = [
    ['שם', data.name],
    ['אימייל', data.email],
    ['טלפון', data.phone || '—'],
    ['שם העסק', data.company || '—'],
    ['נושא', data.topic || '—'],
  ];

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">
      <h2 style="margin:0 0 12px">פנייה חדשה מהאתר</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows.map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v)}</td></tr>`).join('')}
      </table>
      <h3 style="margin:16px 0 6px">הודעה</h3>
      <p style="white-space:pre-wrap;margin:0">${escapeHtml(data.message)}</p>
    </div>`;

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\nהודעה:\n${data.message}`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM || DEFAULT_FROM,
      to: [env.CONTACT_TO || DEFAULT_TO],
      reply_to: data.email,
      subject: `פנייה חדשה מהאתר: ${data.topic || 'כללי'} — ${data.name}`,
      html,
      text,
    }),
  });

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return respond(request, false, 'send_failed', 502);
  }

  return respond(request, true);
}

