// Builds the public pages (Support, Privacy, Terms) for GitHub Pages from the markdown in
// ../website-brief, in the app's look. Run: node build.mjs
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const brief = join(here, '..', 'website-brief');
const email = 'support.theazanapp@gmail.com';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');

// Just what the policies use: # and ## headings, - bullets, paragraphs, links, bold.
function markdown(md) {
  const out = [];
  let list = false;
  for (const raw of md.split('\n')) {
    const line = raw.trim();
    const close = () => { if (list) { out.push('</ul>'); list = false; } };
    if (!line) { close(); continue; }
    if (line.startsWith('## ')) { close(); out.push(`<h2>${inline(line.slice(3))}</h2>`); }
    else if (line.startsWith('# ')) { close(); out.push(`<h1>${inline(line.slice(2))}</h1>`); }
    else if (line.startsWith('- ')) { if (!list) { out.push('<ul>'); list = true; } out.push(`<li>${inline(line.slice(2))}</li>`); }
    else if (/^Last updated/.test(line)) { close(); out.push(`<p class="updated">${inline(line)}</p>`); }
    else { close(); out.push(`<p>${inline(line)}</p>`); }
  }
  if (list) out.push('</ul>');
  return out.join('\n');
}

const page = (title, body, active) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · The Azan App</title>
<meta name="description" content="The Azan App: prayer times, Qibla direction, the Quran and dhikr.">
<link rel="icon" href="app-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root { --ink:#2B323F; --mute:#6E7480; --line:rgba(43,50,63,.10); --bg:#FFFEF4; --card:#FFFFFF; --gold:#9A7228; }
  @media (prefers-color-scheme: dark) { :root { --ink:#ECEEF2; --mute:#A3A9B4; --line:rgba(255,255,255,.10); --bg:#0F1424; --card:#1B2030; --gold:#E2BC6A; } }
  * { box-sizing:border-box; margin:0; }
  body { font-family:'Plus Jakarta Sans', system-ui, sans-serif; background:var(--bg); color:var(--ink); line-height:1.65; -webkit-font-smoothing:antialiased; }
  .sky { height:220px; background:linear-gradient(#4E5C9C,#9D8FC2 55%,#E69A86); }
  .wrap { max-width:760px; margin:-120px auto 0; padding:0 20px 80px; }
  header { display:flex; align-items:center; gap:14px; color:#fff; margin-bottom:26px; }
  header img { width:56px; height:56px; border-radius:14px; box-shadow:0 8px 24px rgba(0,0,0,.18); }
  header b { font-size:20px; font-weight:700; letter-spacing:-.01em; }
  nav { display:flex; gap:6px; margin-left:auto; }
  nav a { color:#fff; text-decoration:none; font-size:14px; font-weight:600; padding:7px 13px; border-radius:999px; background:rgba(255,255,255,.18); }
  nav a.on { background:#fff; color:#2B323F; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:24px; padding:40px 36px; box-shadow:0 30px 60px -40px rgba(43,50,63,.35); }
  h1 { font-size:38px; line-height:1.15; letter-spacing:-.03em; font-weight:800; margin-bottom:6px; }
  h2 { font-size:21px; letter-spacing:-.01em; font-weight:700; margin:34px 0 10px; }
  p, li { font-size:16.5px; color:var(--ink); }
  p + p { margin-top:12px; }
  ul { padding-left:20px; margin-top:8px; } li { margin:8px 0; }
  .updated, .lead { color:var(--mute); }
  .lead { font-size:18px; margin-top:6px; }
  a { color:var(--gold); }
  .contact { display:inline-block; margin-top:18px; padding:13px 22px; border-radius:999px; background:var(--ink); color:var(--bg); text-decoration:none; font-weight:700; }
  details { border-top:1px solid var(--line); padding:16px 0; } details:last-of-type { border-bottom:1px solid var(--line); }
  summary { cursor:pointer; font-weight:700; font-size:17px; list-style:none; } summary::-webkit-details-marker { display:none; }
  summary::after { content:'+'; float:right; color:var(--mute); font-weight:500; } details[open] summary::after { content:'–'; }
  details p { margin-top:10px; color:var(--mute); }
  footer { text-align:center; color:var(--mute); font-size:13px; margin-top:28px; }
  @media (max-width:560px) { .card { padding:28px 20px; } h1 { font-size:30px; } header b { display:none; } }
</style>
</head>
<body>
<div class="sky"></div>
<div class="wrap">
  <header>
    <img src="app-icon.png" alt="">
    <b>The Azan App</b>
    <nav>
      <a href="./" class="${active === 'support' ? 'on' : ''}">Support</a>
      <a href="privacy.html" class="${active === 'privacy' ? 'on' : ''}">Privacy</a>
      <a href="terms.html" class="${active === 'terms' ? 'on' : ''}">Terms</a>
    </nav>
  </header>
  <main class="card">
${body}
  </main>
  <footer>© 2026 Murshid Musthafa · The Azan App</footer>
</div>
</body>
</html>
`;

const faq = [
  ['The prayer times are a few minutes off from my mosque.',
   'Open Settings in the app and choose the Calculation Method and Asr Method your mosque uses. Times follow your location; if location is off, search for your city on the location pill on Home.'],
  ['I don\'t hear the azan.',
   'Turn on the prayer\'s reminder in Settings → Prayer Notification, and make sure notifications are allowed for The Azan App in the iPhone\'s Settings. Silent mode, Focus and Low Power Mode can mute or delay notifications.'],
  ['The Qibla direction looks wrong.',
   'Hold the phone flat, away from magnets and metal, and move it in a figure-eight to calibrate the compass. The direction is calculated from your location to the Kaaba.'],
  ['The Lock Screen countdown doesn\'t appear.',
   'Check Settings → Prayer Notification → Lock Screen in the app, and Live Activities for The Azan App in the iPhone\'s Settings. On iOS 26 and later it starts on its own 30 minutes before each prayer; open the app once a day so it can schedule the next ones.'],
  ['The Hijri date is a day off.',
   'Moon sighting differs by country. Adjust it in Settings → Hijri Date by a day or two either way.'],
  ['Does the app collect my data?',
   'No. There are no accounts, ads, analytics or tracking. Your location is only used to work out prayer times, the Qibla and nearby mosques. See the privacy policy for details.'],
  ['I supported the app and want a refund.',
   'Support payments are handled by Apple. You can request a refund at reportaproblem.apple.com.'],
];

const support = `<h1>Support</h1>
<p class="lead">Prayer times, the Qibla, the Quran and dhikr, in one calm app. Questions, feedback or a problem? We're happy to help.</p>
<a class="contact" href="mailto:${email}">Email support</a>
<p class="updated" style="margin-top:10px">${email}</p>
<h2>Common questions</h2>
${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${inline(a)}</p></details>`).join('\n')}
<h2>About the content</h2>
<p>Answers in the app give the mainstream view with references to the Quran and Sunnah. For a ruling on your own situation, please ask a qualified scholar.</p>`;

writeFileSync(join(here, 'index.html'), page('Support', support, 'support'));
writeFileSync(join(here, 'privacy.html'), page('Privacy Policy', markdown(readFileSync(join(brief, 'privacy-policy.md'), 'utf8')), 'privacy'));
writeFileSync(join(here, 'terms.html'), page('Terms of Use', markdown(readFileSync(join(brief, 'terms.md'), 'utf8')), 'terms'));
copyFileSync(join(brief, 'AppIcon.png'), join(here, 'app-icon.png'));
console.log('Built index.html, privacy.html, terms.html');
