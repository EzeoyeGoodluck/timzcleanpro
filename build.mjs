// Builds the site: combines src/partials + src/pages into public/*.html
// Run with:  node build.mjs   (no npm install needed)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const partials = {};
for (const f of fs.readdirSync(path.join(root, 'src/partials'))) {
  partials[path.basename(f, '.html')] = read(`src/partials/${f}`);
}

// Values available to every page as {{name}}
const globals = {
  ...cfg,
  emailHref: `mailto:${cfg.email}`,
  telHref: `tel:${cfg.phoneTel}`,
  areasInline: cfg.areas.join(' · '),
  areasSentence: cfg.areas.join(', '),
  areasListItems: cfg.areas.map((a) => `<li>${esc(a)}</li>`).join(''),
  areasChips: cfg.areas.map((a) => `<span class="chip">${esc(a)}</span>`).join(''),
  hoursItems: cfg.hours.map(([d, h]) => `<li><span>${esc(d)}</span><span>${esc(h)}</span></li>`).join(''),
};

function parsePage(src) {
  const m = src.match(/^<!--([\s\S]*?)-->\s*/);
  const meta = {};
  if (m) {
    for (const line of m[1].split('\n')) {
      const i = line.indexOf(':');
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return { meta, body: m ? src.slice(m[0].length) : src };
}

function render(tpl, vars, depth = 0) {
  if (depth > 6) throw new Error('Partial nesting too deep');
  return tpl
    .replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
      if (!(name in partials)) throw new Error(`Missing partial: ${name}`);
      return render(partials[name], vars, depth + 1);
    })
    .replace(/\{\{\s*([\w]+)\s*\}\}/g, (_, key) => {
      if (!(key in vars)) throw new Error(`Unknown placeholder {{${key}}}`);
      return vars[key];
    });
}

const pages = fs.readdirSync(path.join(root, 'src/pages')).filter((f) => f.endsWith('.html'));
const sitemap = [];

for (const file of pages) {
  const { meta, body } = parsePage(read(`src/pages/${file}`));
  const slug = path.basename(file, '.html');
  const urlPath = slug === 'index' ? '/' : `/${slug}`;

  const navItems = cfg.nav
    .map(([key, label, href]) => `<li><a href="${href}"${key === slug ? ' aria-current="page"' : ''}>${esc(label)}</a></li>`)
    .join('');

  const exploreKeys = (meta.explore || '').split(',').map((s) => s.trim()).filter(Boolean);
  const explore = exploreKeys.length
    ? `<nav class="explore" aria-label="Related pages"><div class="container"><strong>${esc(meta.exploreLabel || 'Explore:')}</strong>${exploreKeys
        .map((k) => `<a href="${cfg.explore[k][1]}">${esc(cfg.explore[k][0])}</a>`)
        .join('')}</div></nav>`
    : '';

  const vars = {
    ...globals,
    title: esc(meta.title || cfg.name),
    description: esc(meta.description || ''),
    ogDescription: esc(meta.ogDescription || meta.description || ''),
    canonical: cfg.url + (urlPath === '/' ? '/' : urlPath),
    navItems,
    explore,
    ctaTitle: esc(meta.ctaTitle || 'Ready for a Space That Actually Feels Clean?'),
    ctaText: esc(meta.ctaText || 'Get your free, no-obligation quote today — most enquiries get a reply the same day.'),
    ctaHref: meta.ctaHref || '/contact',
    formMessageField: '',
  };

  // The contact page's form also has a message box
  vars.formMessageField = meta.formMessage === 'yes'
    ? '<div class="field"><label for="f-message">Message (optional)</label><textarea id="f-message" name="message" placeholder="Anything we should know — size of property, dates, access…"></textarea></div>'
    : '';

  vars.content = render(body, vars);
  const html = render(partials.layout, vars);
  fs.writeFileSync(path.join(root, 'public', `${slug}.html`), html);
  if (slug !== '404') sitemap.push(vars.canonical);
  console.log(`  built ${slug}.html`);
}

fs.writeFileSync(
  path.join(root, 'public/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join('\n')}\n</urlset>\n`
);
fs.writeFileSync(path.join(root, 'public/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${cfg.url}/sitemap.xml\n`);
console.log(`Done — ${pages.length} pages built into public/`);
