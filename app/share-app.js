/* Sharing תפילתי with friends (הגדרות ← שיתוף האפליקציה): a short personal message with the link to the
   app's site, or the app itself as an APK file (Bluetooth, WhatsApp, Nearby Share, file manager…).
   The APK file is the one installed on this phone, so it works without internet. If that copy can't be
   reached, the latest APK is downloaded from GitHub instead. Hooks into app.js through __tfilati.ext. */
(function () {
  'use strict';
  const T = window.__tfilati;
  if (!T || !T.ext) return;
  const SITE = 'https://luach-sport.github.io/tfilati/';
  const APK = 'https://github.com/luach-sport/tfilati/releases/latest/download/tfilati.apk';
  const FILE = 'share/tfilati.apk';
  const TEXT = 'היי! אני משתמש באפליקציה תפילתי. עוקבים בה אחרי התפילות של השבוע, כמה במניין וכמה בסך הכול, עם תזכורות. עובדת בלי אינטרנט. אשמח מאוד לשתף אותך:';
  const message = () => TEXT + '\n' + SITE;
  const say = (title, sub, icon) => T.toast({ title: title, sub: sub || '', icon: icon || 'check', tone: icon === 'x' ? 'muted' : 'gold' });

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); say('הקישור הועתק', text.replace(/^https:\/\//, '')); return; } catch (e) { /* fall back */ }
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    say(ok ? 'הקישור הועתק' : 'לא הצלחתי להעתיק', text.replace(/^https:\/\//, ''), ok ? 'check' : 'x');
  }

  async function shareLink() {
    if (T.isNative()) {
      try { await T.callRaw('Share', 'share', { title: 'תפילתי', text: message(), dialogTitle: 'שיתוף תפילתי' }); return; } catch (e) {
        if (/cancel/i.test(String(e && (e.message || e)))) return;
      }
    } else if (navigator.share) {
      try { await navigator.share({ title: 'תפילתי', text: TEXT, url: SITE }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    copy(message());
  }

  // Where Android installed this app: the line with base.apk in the process memory map.
  async function installedApk() {
    const r = await T.callRaw('Filesystem', 'readFile', { path: '/proc/self/maps', encoding: 'utf8' });
    const m = String((r && r.data) || '').match(/(\/data\/app\/\S+?\/base\.apk)/);
    if (!m) throw new Error('no base.apk');
    return m[1];
  }

  async function prepareFile() {
    try { await T.callRaw('Filesystem', 'deleteFile', { path: FILE, directory: 'CACHE' }); } catch (e) { /* not there */ }
    try { await T.callRaw('Filesystem', 'mkdir', { path: 'share', directory: 'CACHE', recursive: true }); } catch (e) { /* exists */ }
    try {
      await T.callRaw('Filesystem', 'copy', { from: await installedApk(), to: FILE, toDirectory: 'CACHE' });
    } catch (e) {
      console.warn('apk copy', e && (e.message || e));
      if (navigator.onLine === false) throw new Error('offline');
      say('מוריד את הקובץ…', 'זה לוקח כמה שניות', 'download');
      await T.callRaw('Filesystem', 'downloadFile', { url: APK, path: FILE, directory: 'CACHE', recursive: true });
    }
    const st = await T.callRaw('Filesystem', 'stat', { path: FILE, directory: 'CACHE' });
    if (!st || st.size < 500000) throw new Error('small file');
    return (await T.callRaw('Filesystem', 'getUri', { path: FILE, directory: 'CACHE' })).uri;
  }

  let busy = false;
  async function shareApk() {
    if (!T.isNative()) { window.open(APK, '_blank'); return; }
    if (busy) return;
    busy = true;
    say('מכין את הקובץ…', 'tfilati.apk', 'download');
    try {
      const uri = await prepareFile();
      await T.callRaw('Share', 'share', { title: 'תפילתי', text: message(), files: [uri], dialogTitle: 'שליחת האפליקציה כקובץ' });
    } catch (e) {
      const msg = String(e && (e.message || e));
      if (!/cancel/i.test(msg)) {
        console.warn('share apk', msg);
        say('לא הצלחתי להכין את הקובץ', msg === 'offline' ? 'אין אינטרנט כרגע. אפשר לשלוח קישור לאתר' : 'אפשר לשלוח קישור לאתר במקום', 'x');
      }
    } finally {
      busy = false;
    }
  }

  // The sheet: its own root, with the same look as the app's marking sheet.
  let root = null;
  const opt = (action, icon, title, sub) => '<button type="button" class="opt k-y" data-action="' + action + '"><span class="o-icon">' + T.svg(icon, 22, 2.2) + '</span>' +
    '<span class="o-text"><b>' + T.esc(title) + '</b><span>' + T.esc(sub) + '</span></span></button>';
  function open() {
    if (!root) { root = document.createElement('div'); root.id = 'share-root'; document.body.appendChild(root); }
    root.innerHTML = '<div class="sheet-wrap"><div class="backdrop" data-action="share-close"></div>' +
      '<section class="sheet" role="dialog" aria-modal="true" aria-labelledby="share-title"><div class="handle"></div>' +
      '<div class="sheet-head"><span class="p-icon">' + T.svg('share', 26) + '</span><div class="info"><div>לשלוח לחברים</div><h2 id="share-title">שיתוף האפליקציה</h2></div>' +
      '<button type="button" class="icon-btn" data-action="share-close" aria-label="סגירה">' + T.svg('x', 18, 2.4) + '</button></div>' +
      '<h3>איך לשלוח?</h3><div class="opts">' +
      opt('share-app-link', 'link', 'שליחת קישור לאתר', 'הודעה קצרה עם הקישור, לוואטסאפ ולכל מקום') +
      opt('share-app-apk', 'download', 'שליחת האפליקציה כקובץ (APK)', 'בבלוטות\', בוואטסאפ או במנהל הקבצים. עובד גם בלי אינטרנט') +
      opt('share-app-copy', 'copy', 'העתקת הקישור לאתר', SITE.replace(/^https:\/\//, '').replace(/\/$/, '')) +
      '</div><div class="sheet-foot"><p>ההודעה שנשלחת: ' + T.esc(TEXT) + ' <span class="ltr">' + T.esc(SITE) + '</span></p></div></section></div>';
    requestAnimationFrame(() => requestAnimationFrame(() => { const w = root && root.firstElementChild; if (w) w.classList.add('open'); }));
  }
  function close() {
    const w = root && root.firstElementChild;
    if (!w) return false;
    w.classList.remove('open');
    setTimeout(() => { if (root && root.firstElementChild === w) root.innerHTML = ''; }, 300);
    return true;
  }

  T.ext.back = close;
  T.ext.actions['share-app'] = open;
  T.ext.actions['share-close'] = close;
  T.ext.actions['share-app-link'] = () => { close(); shareLink(); };
  T.ext.actions['share-app-apk'] = () => { close(); shareApk(); };
  T.ext.actions['share-app-copy'] = () => { close(); copy(SITE); };
})();
