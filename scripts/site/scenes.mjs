// The screenshots on תפילתי's site, taken by the Itzko site kit (kit/lib/shots.mjs in luach-sport/itzko).
// The first scene is the welcome screen of a new install; then the app opens with its built-in example
// weeks (index.html?demo=1). Each scene's `run` drives the page from Node; `scroll: null` keeps the scroll
// position the scene set.
export async function prepare(page, { base }) {
  return { base };
}

// Before every scene: close the marking sheet or the share sheet if one is open, and clear messages.
export const reset = () => {
  document.querySelectorAll('[data-action=close-sheet], [data-action=share-close]').forEach((b) => { if (b.closest('.open')) b.click(); });
  const t = document.querySelector('#toast-root');
  if (t) t.innerHTML = '';
};

const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const tab = (page, name) => page.click('[data-action=tab][data-tab=' + name + ']').then(() => page.evaluate(() => window.scrollTo(0, 0)));

// A goal met last week: take one prayer away and mark it again, as if it were just marked.
function celebrate() {
  const T = window.__tfilati, s = T.state;
  const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - d.getDay() - 7);
  const ws = T.keyOf(d);
  for (let i = 0; i < 7; i++) {
    const k = T.keyOf(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i));
    const m = s.marks[k];
    if (m && m[0] === 'm') { m[0] = ''; delete s.celebrated[ws]; T.setMark(k, 0, 'm'); return; }
  }
}

export const SCENES = [
  { name: 'onb', scroll: null, wait: 900, run: (page) => page.waitForSelector('.onb') },
  { name: 'home', wait: 900, run: async (page, { base }) => { await page.goto(base + '/app/index.html?demo=1'); await page.waitForSelector('.top h1'); } },
  { name: 'home-week', scroll: '.legend' },
  { name: 'mark', scroll: null, wait: 700, run: (page) => page.click('[data-action=mark][data-date="' + today() + '"][data-p="1"]') },
  { name: 'marked', scroll: null, wait: 600, run: async (page) => {
    await page.click('[data-action=mark][data-date="' + today() + '"][data-p="1"]');
    await page.waitForTimeout(500);
    await page.click('.sheet .opt.k-m');
  } },
  { name: 'celebration', scroll: null, wait: 1600, run: (page) => page.evaluate(celebrate) },
  { name: 'history', run: async (page) => {
    await page.evaluate(() => { const b = document.querySelector('[data-action=cel-close]'); if (b) b.click(); });
    await page.waitForTimeout(400);
    await tab(page, 'history');
  } },
  { name: 'history-more', scroll: null, run: (page) => page.evaluate(() => window.scrollTo(0, 760)) },
  { name: 'settings', run: (page) => tab(page, 'settings') },
  { name: 'settings-reminders', scroll: null, run: (page) => page.evaluate(() => document.querySelector('#reminders').scrollIntoView({ block: 'start' })) },
  { name: 'settings-end', scroll: 'bottom', run: (page) => tab(page, 'settings') },
  { name: 'share-app', scroll: 'bottom', wait: 800, run: (page) => page.click('[data-action=share-app]') }
];
