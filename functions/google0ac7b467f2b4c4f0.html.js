// Serves the Google site-verification file at its exact URL.
// Cloudflare Pages would otherwise 308-redirect /*.html to the extensionless path,
// and Google's file verification may not accept a redirect.
const BODY = 'google-site-verification: google0ac7b467f2b4c4f0.html';

export function onRequestGet() {
  return new Response(BODY, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' },
  });
}
