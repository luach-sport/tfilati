/* תפילתי — מעקב תפילות שבועי */
'use strict';
(function () {
  // ================= Constants =================
  const APP_VERSION = '1.0.0';
  const STORE_KEY = 'tfilati.v1';
  const CHANNEL = 'tfilati-reminders';
  const PRAYERS = ['שחרית', 'מנחה', 'ערבית'];
  const PKEYS = ['s', 'm', 'a'];
  const PICONS = ['sunrise', 'sunset', 'moon'];
  const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const DAY_LETTERS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
  const ST_LABEL = { m: 'במניין', y: 'ביחיד', x: 'לא התפללתי', '': 'טרם סומן' };
  const VALID = ['m', 'y', 'x'];
  const KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  const MINCHA_OPTIONS = [10, 15, 20, 30, 45, 60];
  const MAX_TIMES = 5;

  const CITIES = [
    { id: 'jerusalem', name: 'ירושלים', lat: 31.7683, lon: 35.2137 },
    { id: 'tel-aviv', name: 'תל אביב', lat: 32.0853, lon: 34.7818 },
    { id: 'haifa', name: 'חיפה', lat: 32.794, lon: 34.9896 },
    { id: 'beer-sheva', name: 'באר שבע', lat: 31.252, lon: 34.7915 },
    { id: 'bnei-brak', name: 'בני ברק', lat: 32.0807, lon: 34.8338 },
    { id: 'petah-tikva', name: 'פתח תקווה', lat: 32.084, lon: 34.8878 },
    { id: 'netanya', name: 'נתניה', lat: 32.3215, lon: 34.8532 },
    { id: 'ashdod', name: 'אשדוד', lat: 31.8044, lon: 34.6553 },
    { id: 'ashkelon', name: 'אשקלון', lat: 31.6688, lon: 34.5743 },
    { id: 'rishon', name: 'ראשון לציון', lat: 31.973, lon: 34.7925 },
    { id: 'holon', name: 'חולון', lat: 32.0158, lon: 34.7874 },
    { id: 'bat-yam', name: 'בת ים', lat: 32.0231, lon: 34.7503 },
    { id: 'ramat-gan', name: 'רמת גן', lat: 32.0684, lon: 34.8248 },
    { id: 'herzliya', name: 'הרצליה', lat: 32.1663, lon: 34.8436 },
    { id: 'raanana', name: 'רעננה', lat: 32.1848, lon: 34.8713 },
    { id: 'kfar-saba', name: 'כפר סבא', lat: 32.175, lon: 34.9069 },
    { id: 'hadera', name: 'חדרה', lat: 32.434, lon: 34.9196 },
    { id: 'rehovot', name: 'רחובות', lat: 31.8928, lon: 34.8113 },
    { id: 'yavne', name: 'יבנה', lat: 31.8781, lon: 34.7397 },
    { id: 'rosh-haayin', name: 'ראש העין', lat: 32.0956, lon: 34.9566 },
    { id: 'elad', name: 'אלעד', lat: 32.0522, lon: 34.9511 },
    { id: 'modiin', name: 'מודיעין', lat: 31.8969, lon: 35.0095 },
    { id: 'modiin-illit', name: 'מודיעין עילית', lat: 31.9333, lon: 35.0414 },
    { id: 'beit-shemesh', name: 'בית שמש', lat: 31.747, lon: 34.9881 },
    { id: 'beitar-illit', name: 'ביתר עילית', lat: 31.697, lon: 35.121 },
    { id: 'maale-adumim', name: 'מעלה אדומים', lat: 31.777, lon: 35.298 },
    { id: 'ariel', name: 'אריאל', lat: 32.1066, lon: 35.1803 },
    { id: 'kiryat-gat', name: 'קריית גת', lat: 31.61, lon: 34.7642 },
    { id: 'afula', name: 'עפולה', lat: 32.6078, lon: 35.2898 },
    { id: 'tiberias', name: 'טבריה', lat: 32.7922, lon: 35.5312 },
    { id: 'safed', name: 'צפת', lat: 32.9646, lon: 35.496 },
    { id: 'karmiel', name: 'כרמיאל', lat: 32.917, lon: 35.295 },
    { id: 'nahariya', name: 'נהריה', lat: 33.0059, lon: 35.0941 },
    { id: 'eilat', name: 'אילת', lat: 29.5577, lon: 34.9519 }
  ];

  const QUOTES = [
    { t: 'אֵין הַקָּדוֹשׁ בָּרוּךְ הוּא מוֹאֵס בִּתְפִלָּתָן שֶׁל רַבִּים', s: 'ברכות ח׳ ע״א' },
    { t: 'אֵימָתַי עֵת רָצוֹן? בְּשָׁעָה שֶׁהַצִּבּוּר מִתְפַּלְּלִין', s: 'ברכות ח׳ ע״א' },
    { t: 'כָּל הַקּוֹבֵעַ מָקוֹם לִתְפִלָּתוֹ, אֱלֹהֵי אַבְרָהָם בְּעֶזְרוֹ', s: 'ברכות ו׳ ע״ב' },
    { t: 'גְּדוֹלָה תְּפִלָּה יוֹתֵר מִמַּעֲשִׂים טוֹבִים', s: 'ברכות ל״ב ע״ב' },
    { t: 'וְהַלְוַאי שֶׁיִּתְפַּלֵּל אָדָם כׇּל הַיּוֹם כּוּלּוֹ', s: 'ברכות כ״א ע״א' },
    { t: 'בְּרׇב עָם הַדְרַת מֶלֶךְ', s: 'משלי י״ד, כ״ח' },
    { t: 'קָרוֹב ה׳ לְכׇל קֹרְאָיו, לְכֹל אֲשֶׁר יִקְרָאֻהוּ בֶאֱמֶת', s: 'תהלים קמ״ה, י״ח' },
    { t: 'וַאֲנִי תְפִלָּתִי לְךָ ה׳ עֵת רָצוֹן', s: 'תהלים ס״ט, י״ד' },
    { t: 'שִׁוִּיתִי ה׳ לְנֶגְדִּי תָמִיד', s: 'תהלים ט״ז, ח׳' },
    { t: 'וַאֲנִי תְפִלָּה', s: 'תהלים ק״ט, ד׳' }
  ];
  const CHEERS_BOTH = ['יישר כוח!', 'אשריך!', 'חזק וברוך!', 'כל הכבוד!'];
  const CHEERS_ONE = ['יישר כוח!', 'כל הכבוד!', 'חזק!', 'אשריך!'];

  // ================= Icons =================
  const P = {
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    sunrise: '<path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
    sunset: '<path d="M12 10V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M16 6 12 2 8 6"/><path d="M12 2v13"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    sparkle: '<path d="M12 3l1.9 5.8L20 10.7l-5.8 1.9L12 18.5l-1.9-5.9L4 10.7l6.1-1.9z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
  };
  function svg(name, size, sw) {
    const s = size || 20;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 2) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[name] + '</svg>';
  }

  // ================= Small helpers =================
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const pad = (n) => String(n).padStart(2, '0');

  // ================= Dates =================
  const keyOf = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parseKey = (k) => { const a = k.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2], 12); };
  const dateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12);
  const todayDate = () => dateOnly(new Date());
  const startOfWeek = (d) => addDays(d, -d.getDay());
  const sameDay = (a, b) => keyOf(a) === keyOf(b);
  function atTime(d, hhmm) { const t = hhmm.split(':').map(Number); return new Date(d.getFullYear(), d.getMonth(), d.getDate(), t[0], t[1], 0, 0); }
  const hhmm = (dt) => pad(dt.getHours()) + ':' + pad(dt.getMinutes());

  function fmt(locale, opts) { try { return new Intl.DateTimeFormat(locale, opts); } catch (e) { return null; } }
  const F_HEB = fmt('he-u-ca-hebrew', { day: 'numeric', month: 'long', year: 'numeric' });
  const F_HEB_EN = fmt('en-u-ca-hebrew', { day: 'numeric', month: 'long' });
  const F_MONTH = fmt('he', { month: 'long' });
  const F_MONTH_YEAR = fmt('he', { month: 'long', year: 'numeric' });

  function gematriya(n) {
    n = Math.floor(n);
    if (!(n > 0 && n < 1000)) return String(n);
    const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    const hundreds = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק'];
    let s = hundreds[Math.floor(n / 100)];
    const r = n % 100;
    if (r === 15) s += 'טו';
    else if (r === 16) s += 'טז';
    else s += tens[Math.floor(r / 10)] + ones[r % 10];
    if (s.length === 1) return s + '׳';
    return s.slice(0, -1) + '״' + s.slice(-1);
  }
  const hebCache = {};
  function hebParts(d) {
    const k = keyOf(d);
    if (k in hebCache) return hebCache[k];
    let res = null;
    try {
      if (F_HEB && F_HEB_EN) {
        const parts = F_HEB.formatToParts(d);
        const get = (t) => { const p = parts.find((x) => x.type === t); return p ? p.value : ''; };
        const en = F_HEB_EN.formatToParts(d).find((x) => x.type === 'month');
        const day = parseInt(String(get('day')).replace(/\D/g, ''), 10);
        const year = parseInt(String(get('year') || get('relatedYear')).replace(/\D/g, ''), 10);
        if (day > 0) res = { day: day, month: get('month'), year: year, enMonth: en ? en.value : '' };
      }
    } catch (e) { res = null; }
    hebCache[k] = res;
    return res;
  }
  function hebDate(d, withYear) {
    const h = hebParts(d);
    if (!h) return '';
    return gematriya(h.day) + ' ב' + h.month + (withYear && h.year ? ' ' + gematriya(h.year % 1000) : '');
  }
  function hebShort(d) { const h = hebParts(d); return h ? gematriya(h.day) + ' ' + h.month : ''; }
  const monthLong = (d) => (F_MONTH ? F_MONTH.format(d) : String(d.getMonth() + 1));
  function gregRange(ws) {
    const we = addDays(ws, 6);
    if (ws.getMonth() === we.getMonth()) return ws.getDate() + '–' + we.getDate() + ' ב' + monthLong(ws);
    return ws.getDate() + ' ב' + monthLong(ws) + ' – ' + we.getDate() + ' ב' + monthLong(we);
  }
  function hebRange(ws) { const a = hebShort(ws), b = hebShort(addDays(ws, 6)); return a && b ? a + ' – ' + b : ''; }

  // Yom Tov in Israel (one day, except Rosh Hashana)
  const YOMTOV = { Tishri: [1, 2, 10, 15, 22], Nisan: [15, 21], Sivan: [6] };
  function isYomTov(d) { const h = hebParts(d); if (!h) return false; const l = YOMTOV[h.enMonth]; return !!(l && l.indexOf(h.day) >= 0); }
  const isHoly = (d) => d.getDay() === 6 || isYomTov(d);

  // ================= Sun (NOAA almanac algorithm) =================
  const RAD = Math.PI / 180;
  const sinD = (x) => Math.sin(x * RAD), cosD = (x) => Math.cos(x * RAD), tanD = (x) => Math.tan(x * RAD);
  const norm360 = (x) => ((x % 360) + 360) % 360;
  /** Time (absolute Date) when the sun descends to `zenith` degrees on local date d. */
  function sunDown(d, lat, lon, zenith) {
    const y = d.getFullYear(), mo = d.getMonth(), da = d.getDate();
    const N = Math.round((Date.UTC(y, mo, da) - Date.UTC(y, 0, 0)) / 864e5);
    const lngHour = lon / 15;
    const t = N + ((18 - lngHour) / 24);
    const M = 0.9856 * t - 3.289;
    const L = norm360(M + 1.916 * sinD(M) + 0.02 * sinD(2 * M) + 282.634);
    let RA = norm360(Math.atan(0.91764 * tanD(L)) / RAD);
    RA = (RA + (Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90)) / 15;
    const sinDec = 0.39782 * sinD(L);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (cosD(zenith) - sinDec * sinD(lat)) / (cosDec * cosD(lat));
    if (cosH > 1 || cosH < -1) return null;
    const H = Math.acos(cosH) / RAD / 15;
    const T = H + RA - 0.06571 * t - 6.622;
    const UT = ((T - lngHour) % 24 + 24) % 24;
    return new Date(Date.UTC(y, mo, da) + UT * 3600e3);
  }
  const sunset = (d, c) => sunDown(d, c.lat, c.lon, 90.833);
  const nightfall = (d, c) => sunDown(d, c.lat, c.lon, 98.5);
  const cityById = (id) => CITIES.find((c) => c.id === id) || CITIES[0];

  /** Is moment t inside Shabbat / Yom Tov (with margins)? */
  function inQuiet(t, city) {
    const d = dateOnly(t);
    if (isHoly(d)) {
      const nf = nightfall(d, city);
      if (!nf || t.getTime() < nf.getTime() + 15 * 60e3) return true;
    }
    if (isHoly(addDays(d, 1))) {
      const ss = sunset(d, city);
      if (!ss || t.getTime() > ss.getTime() - 45 * 60e3) return true;
    }
    return false;
  }

  // ================= State =================
  let state = null;
  const ui = {
    tab: 'home', weekStart: null, todayKey: '', histMode: 'weeks', sheet: null, overlay: null,
    addTime: null, addPlace: false, undo: null, perm: null, exact: null, demo: false, lastFocus: null
  };

  function defaults() {
    return {
      v: 1,
      createdAt: keyOf(todayDate()),
      marks: {},
      places: {},
      celebrated: {},
      lastSummary: '',
      settings: {
        onboarded: false,
        goalMinyan: 10,
        goalTotal: 15,
        nightly: { on: true, time: '22:00' },
        reminders: { s: { on: false, times: ['07:00'] }, m: { on: false, times: ['13:30'] }, a: { on: false, times: ['20:00'] } },
        mincha: { on: false, minutes: 30 },
        shabbatQuiet: true,
        city: 'jerusalem',
        placeList: ['בית הכנסת הקבוע', 'בעבודה', 'בבית'],
        haptics: true
      }
    };
  }
  const isObj = (o) => o && typeof o === 'object' && !Array.isArray(o);
  const cleanText = (s, max) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, max || 40);
  function cleanTimes(arr, fallback) {
    if (!Array.isArray(arr)) return fallback.slice();
    const out = [];
    arr.forEach((t) => { if (typeof t === 'string' && TIME_RE.test(t) && out.indexOf(t) < 0) out.push(t); });
    out.sort();
    return out.slice(0, MAX_TIMES);
  }
  function normalize(raw) {
    const out = defaults();
    if (!isObj(raw)) return out;
    if (typeof raw.createdAt === 'string' && KEY_RE.test(raw.createdAt)) out.createdAt = raw.createdAt;
    if (isObj(raw.marks)) {
      Object.keys(raw.marks).forEach((k) => {
        const a = raw.marks[k];
        if (!KEY_RE.test(k) || !Array.isArray(a)) return;
        const v = [0, 1, 2].map((i) => (VALID.indexOf(a[i]) >= 0 ? a[i] : ''));
        if (v.some(Boolean)) out.marks[k] = v;
      });
    }
    if (isObj(raw.places)) {
      Object.keys(raw.places).forEach((k) => {
        const a = raw.places[k];
        if (!KEY_RE.test(k) || !Array.isArray(a)) return;
        const v = [0, 1, 2].map((i) => (typeof a[i] === 'string' ? cleanText(a[i]) : ''));
        if (v.some(Boolean)) out.places[k] = v;
      });
    }
    if (isObj(raw.celebrated)) {
      Object.keys(raw.celebrated).forEach((k) => {
        const c = raw.celebrated[k];
        if (KEY_RE.test(k) && isObj(c)) out.celebrated[k] = { m: !!c.m, t: !!c.t };
      });
    }
    if (typeof raw.lastSummary === 'string') out.lastSummary = raw.lastSummary;
    const s = isObj(raw.settings) ? raw.settings : {};
    const d = out.settings;
    d.onboarded = !!s.onboarded;
    const gm = parseInt(s.goalMinyan, 10), gt = parseInt(s.goalTotal, 10);
    if (gm >= 1 && gm <= 21) d.goalMinyan = gm;
    if (gt >= 1 && gt <= 21) d.goalTotal = gt;
    if (d.goalTotal < d.goalMinyan) d.goalTotal = d.goalMinyan;
    if (isObj(s.nightly)) {
      d.nightly.on = s.nightly.on !== false;
      if (TIME_RE.test(s.nightly.time || '')) d.nightly.time = s.nightly.time;
    }
    if (isObj(s.reminders)) {
      PKEYS.forEach((pk) => {
        const r = s.reminders[pk];
        if (!isObj(r)) return;
        d.reminders[pk].on = !!r.on;
        d.reminders[pk].times = cleanTimes(r.times, d.reminders[pk].times);
      });
    }
    if (isObj(s.mincha)) {
      d.mincha.on = !!s.mincha.on;
      if (MINCHA_OPTIONS.indexOf(+s.mincha.minutes) >= 0) d.mincha.minutes = +s.mincha.minutes;
    }
    if (typeof s.shabbatQuiet === 'boolean') d.shabbatQuiet = s.shabbatQuiet;
    if (CITIES.some((c) => c.id === s.city)) d.city = s.city;
    if (Array.isArray(s.placeList)) {
      const pl = [];
      s.placeList.forEach((p) => { const t = cleanText(p); if (t && pl.indexOf(t) < 0) pl.push(t); });
      d.placeList = pl.slice(0, 12);
    }
    if (typeof s.haptics === 'boolean') d.haptics = s.haptics;
    return out;
  }

  async function loadState() {
    let raw = null;
    if (isNative()) {
      const r = await call('Preferences', 'get', { key: STORE_KEY });
      if (r && typeof r.value === 'string' && r.value) raw = r.value;
    }
    if (!raw) { try { raw = localStorage.getItem(STORE_KEY); } catch (e) { raw = null; } }
    let parsed = null;
    if (raw) { try { parsed = JSON.parse(raw); } catch (e) { parsed = null; } }
    state = normalize(parsed);
  }
  function saveState() {
    if (ui.demo) return;
    const raw = JSON.stringify(state);
    try { localStorage.setItem(STORE_KEY, raw); } catch (e) { /* ignore */ }
    if (isNative()) call('Preferences', 'set', { key: STORE_KEY, value: raw });
  }

  // ================= Stats =================
  const goals = () => ({ m: state.settings.goalMinyan, t: state.settings.goalTotal });
  const dayMarks = (k) => state.marks[k] || ['', '', ''];
  const dayPlaces = (k) => state.places[k] || ['', '', ''];
  function weekStats(ws) {
    let m = 0, y = 0, x = 0;
    for (let i = 0; i < 7; i++) {
      dayMarks(keyOf(addDays(ws, i))).forEach((s) => { if (s === 'm') m++; else if (s === 'y') y++; else if (s === 'x') x++; });
    }
    return { m: m, y: y, t: m + y, x: x };
  }
  const met = (s) => { const g = goals(); return s.m >= g.m && s.t >= g.t; };
  function firstWeek() {
    let first = startOfWeek(parseKey(state.createdAt));
    Object.keys(state.marks).forEach((k) => { const w = startOfWeek(parseKey(k)); if (w < first) first = w; });
    return first;
  }
  function streak() {
    const cur = startOfWeek(todayDate());
    const first = firstWeek();
    let n = 0;
    for (let w = addDays(cur, -7), i = 0; w >= first && i < 520; w = addDays(w, -7), i++) {
      if (met(weekStats(w))) n++; else break;
    }
    return n + (met(weekStats(cur)) ? 1 : 0);
  }
  const prayedCount = (arr) => arr.filter((s) => s === 'm' || s === 'y').length;

  // ================= Capacitor bridge =================
  function capacitor() { const rt = window.TfilatiCap; return (rt && rt.Capacitor) || window.Capacitor || null; }
  function isNative() {
    const C = capacitor();
    if (!C) return false;
    try {
      if (typeof C.isNativePlatform === 'function') return !!C.isNativePlatform();
      return C.isNative === true || C.platform === 'android' || C.platform === 'ios';
    } catch (e) { return false; }
  }
  const pluginCache = {};
  function plugin(name) {
    if (!isNative()) return null;
    if (Object.prototype.hasOwnProperty.call(pluginCache, name)) return pluginCache[name];
    let p = null;
    try {
      const rt = window.TfilatiCap;
      if (rt && typeof rt.registerPlugin === 'function') p = rt.registerPlugin(name);
      else if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins[name]) p = window.Capacitor.Plugins[name];
    } catch (e) { p = null; }
    pluginCache[name] = p;
    return p;
  }
  async function callRaw(name, method, args) {
    const p = plugin(name);
    if (!p) throw new Error('no-plugin');
    const fn = p[method];
    if (typeof fn !== 'function') throw new Error('no-method');
    return fn.call(p, args);
  }
  async function call(name, method, args) {
    try { return await callRaw(name, method, args); } catch (e) { console.warn('[native]', name, method, e && (e.message || e)); return undefined; }
  }
  async function listen(name, event, cb) {
    const p = plugin(name);
    if (!p) return;
    try { await p.addListener(event, cb); } catch (e) { console.warn('[native] listen', name, event, e && e.message); }
  }
  function haptic(kind) {
    if (!state || !state.settings.haptics) return;
    if (isNative()) {
      if (kind === 'success') call('Haptics', 'notification', { type: 'SUCCESS' });
      else call('Haptics', 'impact', { style: 'LIGHT' });
    } else if (navigator.vibrate) {
      try { navigator.vibrate(kind === 'success' ? [20, 40, 20] : 10); } catch (e) { /* ignore */ }
    }
  }

  // ================= Rendering: shared =================
  function switchHtml(path, on, label) {
    return '<button type="button" class="switch" role="switch" aria-checked="' + (on ? 'true' : 'false') + '" aria-label="' + esc(label) +
      '" data-action="toggle" data-path="' + path + '"><span class="tr"><span class="kn"></span></span></button>';
  }
  function ringsHtml(st, g) {
    const C1 = 2 * Math.PI * 64, C2 = 2 * Math.PI * 46;
    const pm = Math.min(1, st.m / g.m), pt = Math.min(1, st.t / g.t);
    const a1 = Math.max(0.01, pm * C1).toFixed(1), a2 = Math.max(0.01, pt * C2).toFixed(1);
    return '<div class="rings" role="img" aria-label="' + st.m + ' מתוך ' + g.m + ' במניין, ' + st.t + ' מתוך ' + g.t + ' בסך הכול">' +
      '<svg viewBox="0 0 150 150" aria-hidden="true">' +
      '<circle cx="75" cy="75" r="64" fill="none" stroke="#2A2410" stroke-width="12"/>' +
      '<circle class="arc" cx="75" cy="75" r="64" fill="none" stroke="#F2C14E" stroke-width="12" stroke-linecap="round" transform="rotate(-90 75 75)" style="stroke-dasharray:' + a1 + ' ' + C1.toFixed(1) + '"/>' +
      '<circle cx="75" cy="75" r="46" fill="none" stroke="#14233F" stroke-width="12"/>' +
      '<circle class="arc" cx="75" cy="75" r="46" fill="none" stroke="#7FB2FF" stroke-width="12" stroke-linecap="round" transform="rotate(-90 75 75)" style="stroke-dasharray:' + a2 + ' ' + C2.toFixed(1) + '"/>' +
      '</svg><div class="center"><div class="num">' + st.m + '<small>/' + g.m + '</small></div><div class="lbl">במניין</div></div></div>';
  }
  function barRow(label, cls, v, goal) {
    const pct = Math.min(100, (v / goal) * 100).toFixed(1);
    return '<div class="bar-row"><div class="bar-top"><span><i class="dot ' + cls + '"></i>' + label + '</span><b>' + v + '<small>/' + goal + '</small></b></div>' +
      '<div class="track ' + cls + '"><div class="fill" style="width:' + pct + '%"></div></div></div>';
  }
  function weekMessage(st, g, isCurrent, today) {
    const needM = Math.max(0, g.m - st.m), needT = Math.max(0, g.t - st.t);
    if (!needM && !needT) return isCurrent ? 'עמדת בשני היעדים השבוע. יישר כוח!' : 'עמדת בשני היעדים בשבוע הזה.';
    if (!isCurrent) {
      if (!needM) return 'עמדת ביעד המניין. לסה״כ חסרו ' + needT + '.';
      if (!needT) return 'עמדת ביעד הסה״כ. למניין חסרו ' + needM + '.';
      return 'חסרו ' + needM + ' במניין ו־' + needT + ' בסה״כ.';
    }
    const left = 7 - today.getDay();
    const days = left === 1 ? 'נשאר היום האחרון' : 'נשארו ' + left + ' ימים';
    if (!needM) return 'יעד המניין הושג! עוד ' + needT + ' לסה״כ · ' + days;
    if (!needT) return 'יעד הסה״כ הושג! עוד ' + needM + ' במניין · ' + days;
    return 'עוד ' + needM + ' במניין ועוד ' + needT + ' בסה״כ · ' + days;
  }

  // ================= Home =================
  function viewHome() {
    const today = todayDate();
    const ws = ui.weekStart;
    const curWs = startOfWeek(today);
    const isCurrent = sameDay(ws, curWs);
    const g = goals();
    const st = weekStats(ws);
    const sk = streak();
    let h = '';

    h += '<header class="top">';
    h += '<svg class="stars" width="160" height="70" viewBox="0 0 160 70" aria-hidden="true"><circle cx="12" cy="18" r="1.4" fill="#F3EFE6"/><circle cx="48" cy="8" r="1" fill="#F3EFE6"/><circle cx="86" cy="30" r="1.6" fill="#F2C14E"/><circle cx="120" cy="12" r="1" fill="#F3EFE6"/><circle cx="150" cy="40" r="1.2" fill="#F3EFE6"/><circle cx="30" cy="52" r="0.9" fill="#F3EFE6"/></svg>';
    h += '<div><div class="date-line">יום ' + DAY_NAMES[today.getDay()] + ' · ' + esc(hebDate(today, true)) + '</div>';
    h += '<h1>' + (isCurrent ? 'השבוע שלי' : 'שבוע קודם') + '</h1></div>';
    if (sk > 0) h += '<div class="chip-streak">' + svg('flame', 16, 2.2).replace('currentColor', '#F2C14E') + (sk === 1 ? 'שבוע ראשון ביעד' : sk + ' שבועות ברצף') + '</div>';
    h += '</header>';

    // week navigation
    const canNext = ws < curWs;
    h += '<div class="week-nav">' +
      '<button type="button" class="icon-btn" data-action="week-prev" aria-label="השבוע הקודם">' + svg('chevR', 20) + '</button>' +
      '<div class="range"><b>' + esc(gregRange(ws)) + '</b><span>' + esc(hebRange(ws)) + '</span></div>' +
      '<button type="button" class="icon-btn" data-action="week-next" aria-label="השבוע הבא"' + (canNext ? '' : ' disabled') + '>' + svg('chevL', 20) + '</button></div>';
    if (!isCurrent) h += '<div style="text-align:center"><button type="button" class="link-btn" data-action="week-today">חזרה לשבוע הנוכחי</button></div>';

    // weekly summary of last week
    if (isCurrent) h += summaryCard(today);

    // hero
    h += '<section class="card hero" aria-label="התקדמות שבועית">' + ringsHtml(st, g) +
      '<div class="hero-side">' + barRow('במניין', 'gold', st.m, g.m) + barRow('סה״כ', 'sky', st.t, g.t) +
      '<p class="hero-msg">' + esc(weekMessage(st, g, isCurrent, today)) + '</p></div></section>';

    // today
    if (isCurrent) {
      const tk = keyOf(today);
      const tm = dayMarks(tk);
      h += '<section class="section" aria-label="התפילות של היום"><div class="section-head"><h2>היום · יום ' + DAY_NAMES[today.getDay()] + '</h2><span class="meta">לחץ לסימון</span></div><div class="tiles">';
      PRAYERS.forEach((n, p) => {
        const s = tm[p];
        h += '<button type="button" class="tile st-' + (s || 'p') + '" data-action="mark" data-date="' + tk + '" data-p="' + p + '" aria-label="' + n + ' היום: ' + ST_LABEL[s] + '. לחץ לסימון">' +
          '<span class="t-icon">' + svg(PICONS[p], 22) + '</span><span class="t-name">' + n + '</span><span class="t-status">' + ST_LABEL[s] + '</span></button>';
      });
      h += '</div></section>';
    }

    // grid
    h += '<section class="card week" aria-label="מבט שבועי"><div class="card-head"><h2>מבט שבועי</h2><span class="meta">לחץ על משבצת לסימון</span></div>';
    h += '<div class="grid-row head"><span></span>';
    for (let i = 0; i < 7; i++) {
      const d = addDays(ws, i);
      h += '<div class="dhead' + (sameDay(d, today) ? ' today' : '') + '"><span class="l">' + DAY_LETTERS[i] + '</span><span class="n">' + d.getDate() + '.' + (d.getMonth() + 1) + '</span></div>';
    }
    h += '</div>';
    PRAYERS.forEach((n, p) => {
      h += '<div class="grid-row"><span class="rlabel">' + n + '</span>';
      for (let i = 0; i < 7; i++) {
        const d = addDays(ws, i);
        const k = keyOf(d);
        const future = d > today;
        const s = dayMarks(k)[p];
        let inner = '';
        let cls = 'c';
        if (future) cls += ' f';
        else if (s === 'm') { cls += ' m'; inner = svg('users', 16, 2.4); }
        else if (s === 'y') { cls += ' y'; inner = svg('user', 15, 2.4); }
        else if (s === 'x') { cls += ' x'; inner = svg('x', 13, 2.6); }
        const aria = n + ', יום ' + DAY_NAMES[i] + ' ' + d.getDate() + '.' + (d.getMonth() + 1) + ': ' + (future ? 'עוד לא הגיע' : ST_LABEL[s]);
        h += '<button type="button" class="cell" data-action="mark" data-date="' + k + '" data-p="' + p + '" aria-label="' + aria + '"' + (future ? ' disabled' : '') + '><span class="' + cls + '">' + inner + '</span></button>';
      }
      h += '</div>';
    });
    h += '<div class="legend"><span><i class="lg m"></i>במניין</span><span><i class="lg y"></i>ביחיד</span><span><i class="lg x"></i>לא התפללתי</span><span><i class="lg p"></i>טרם סומן</span></div>';
    h += '</section>';
    return h;
  }

  function summaryCard(today) {
    const dow = today.getDay();
    if (dow > 2) return '';
    const prev = addDays(startOfWeek(today), -7);
    const pk = keyOf(prev);
    if (state.lastSummary === pk) return '';
    const st = weekStats(prev);
    if (st.t + st.x === 0) return '';
    const g = goals();
    const okM = st.m >= g.m, okT = st.t >= g.t;
    let msg;
    if (okM && okT) msg = 'עמדת בשני היעדים. יישר כוח!';
    else if (okM) msg = 'עמדת ביעד המניין. השבוע נכוון גם לסה״כ.';
    else if (okT) msg = 'עמדת ביעד הסה״כ. השבוע נכוון גם למניין.';
    else msg = 'שבוע חדש, התחלה חדשה. בהצלחה!';
    return '<section class="card summary" aria-label="סיכום השבוע שעבר"><span class="s-icon">' + svg(okM && okT ? 'sparkle' : 'calendar', 20) + '</span>' +
      '<div><h2>השבוע שעבר: ' + st.m + ' במניין · ' + st.t + ' סה״כ</h2><p>' + msg + '</p></div>' +
      '<button type="button" class="icon-btn x" data-action="dismiss-summary" data-week="' + pk + '" aria-label="סגירת הסיכום" style="width:36px;height:36px">' + svg('x', 16) + '</button></section>';
  }

  // ================= History =================
  function historyData() {
    const today = todayDate();
    const cur = startOfWeek(today);
    const first = firstWeek();
    const weeks = [];
    for (let w = cur, i = 0; w >= first && i < 520; w = addDays(w, -7), i++) weeks.push(w);
    const completed = weeks.slice(1).map((w) => ({ w: w, s: weekStats(w) }));
    const metCount = completed.filter((x) => met(x.s)).length;
    const avgM = completed.length ? completed.reduce((a, x) => a + x.s.m, 0) / completed.length : null;
    return { today: today, cur: cur, weeks: weeks, completed: completed, metCount: metCount, avgM: avgM };
  }

  function viewHistory() {
    const g = goals();
    const H = historyData();
    const hasAny = Object.keys(state.marks).length > 0;
    let h = '<header class="top" style="align-items:center"><h1 style="margin:0">היסטוריה</h1>' +
      '<div class="seg" role="group" aria-label="תצוגה">' +
      '<button type="button" data-action="hist-mode" data-mode="weeks" aria-pressed="' + (ui.histMode === 'weeks') + '">שבועות</button>' +
      '<button type="button" data-action="hist-mode" data-mode="months" aria-pressed="' + (ui.histMode === 'months') + '">חודשים</button></div></header>';

    if (!hasAny) {
      return h + '<section class="card" style="margin-top:16px"><div class="empty"><b>עוד אין היסטוריה</b>ברגע שתתחיל לסמן תפילות, כאן יופיעו הגרפים, הרצף והסיכומים שלך.</div></section>';
    }

    const sk = streak();
    h += '<div class="stats">' +
      '<div class="stat"><div class="v gold">' + sk + svg('flame', 16, 2.2) + '</div><div class="k">שבועות ברצף</div></div>' +
      '<div class="stat"><div class="v ltr" style="justify-content:flex-end">' + H.metCount + '<small>/' + H.completed.length + '</small></div><div class="k">שבועות ביעד</div></div>' +
      '<div class="stat"><div class="v">' + (H.avgM == null ? '—' : (Math.round(H.avgM * 10) / 10)) + '</div><div class="k">ממוצע במניין</div></div></div>';

    h += ui.histMode === 'weeks' ? weeksChart(H, g) : monthsChart();
    h += prayerBreakdown(H);
    h += placesCard();
    h += weeksList(H);
    return h;
  }

  function weeksChart(H, g) {
    const CH = 180, U = CH / 21;
    const list = H.weeks.slice(0, 8).reverse(); // oldest -> newest (right -> left in RTL)
    let h = '<section class="card" style="margin-top:14px" aria-label="גרף שבועי"><div class="card-head"><h2>' + (list.length > 1 ? list.length + ' השבועות האחרונים' : 'השבוע') + '</h2><span class="meta">מתוך 21</span></div>';
    h += '<div class="chart-legend"><span><i class="sq" style="background:#F2C14E"></i>במניין</span><span><i class="sq" style="background:#7FB2FF"></i>ביחיד</span>' +
      '<span><i class="dash" style="border-color:#F2C14E"></i>יעד ' + g.m + '</span><span><i class="dash" style="border-color:#7FB2FF"></i>יעד ' + g.t + '</span></div>';
    const desc = list.map((w) => { const s = weekStats(w); return gregRange(w) + ': ' + s.m + ' במניין, ' + s.y + ' ביחיד'; }).join('. ');
    h += '<div class="chart" role="img" aria-label="' + esc(desc) + '">';
    h += '<div class="base"></div>';
    h += '<div class="goal" style="bottom:' + (g.m * U).toFixed(1) + 'px;border-color:#F2C14E"></div><span class="glabel" style="bottom:' + (g.m * U).toFixed(1) + 'px;color:#F2C14E">' + g.m + '</span>';
    if (g.t !== g.m) h += '<div class="goal" style="bottom:' + (g.t * U).toFixed(1) + 'px;border-color:#7FB2FF"></div><span class="glabel" style="bottom:' + (g.t * U).toFixed(1) + 'px;color:#7FB2FF">' + g.t + '</span>';
    h += '<div class="bars">';
    list.forEach((w) => {
      const s = weekStats(w);
      const cur = sameDay(w, H.cur);
      const ok = met(s);
      h += '<button type="button" class="bar' + (cur ? ' cur' : '') + '" data-action="open-week" data-date="' + keyOf(w) + '" aria-label="פתיחת שבוע ' + esc(gregRange(w)) + '">';
      if (ok) h += '<span class="ok">' + svg('check', 11, 3.4) + '</span>';
      if (s.y) h += '<span class="seg-y' + (s.m ? '' : ' solo') + '" style="height:' + (s.y * U).toFixed(1) + 'px"></span>';
      if (s.m) h += '<span class="seg-m' + (s.y ? '' : ' solo') + '" style="height:' + (s.m * U).toFixed(1) + 'px"></span>';
      h += '</button>';
    });
    h += '</div></div><div class="xlabels" aria-hidden="true">';
    list.forEach((w) => { const cur = sameDay(w, H.cur); h += '<span' + (cur ? ' class="cur"' : '') + '>' + (cur ? 'השבוע' : w.getDate() + '.' + (w.getMonth() + 1)) + '</span>'; });
    h += '</div></section>';
    return h;
  }

  function monthsChart() {
    const now = todayDate();
    const months = [];
    for (let i = 5; i >= 0; i--) months.push(new Date(now.getFullYear(), now.getMonth() - i, 1, 12));
    const data = months.map((m) => {
      let mm = 0, yy = 0;
      Object.keys(state.marks).forEach((k) => {
        const d = parseKey(k);
        if (d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth()) state.marks[k].forEach((s) => { if (s === 'm') mm++; else if (s === 'y') yy++; });
      });
      return { d: m, m: mm, y: yy, t: mm + yy };
    });
    const max = Math.max(10, Math.ceil(Math.max.apply(null, data.map((x) => x.t)) / 10) * 10);
    const CH = 160, U = CH / max;
    let h = '<section class="card" style="margin-top:14px" aria-label="גרף חודשי"><div class="card-head"><h2>6 החודשים האחרונים</h2><span class="meta">תפילות בחודש</span></div>';
    h += '<div class="chart-legend"><span><i class="sq" style="background:#F2C14E"></i>במניין</span><span><i class="sq" style="background:#7FB2FF"></i>ביחיד</span></div>';
    const desc = data.map((x) => monthLong(x.d) + ': ' + x.m + ' במניין, ' + x.y + ' ביחיד').join('. ');
    h += '<div class="chart" style="height:' + (CH + 20) + 'px" role="img" aria-label="' + esc(desc) + '"><div class="base" style="right:0"></div><div class="bars" style="right:0">';
    data.forEach((x, i) => {
      const cur = i === data.length - 1;
      h += '<div class="bar' + (cur ? ' cur' : '') + '">';
      if (x.t) h += '<span class="val">' + x.t + '</span>';
      if (x.y) h += '<span class="seg-y' + (x.m ? '' : ' solo') + '" style="height:' + (x.y * U).toFixed(1) + 'px"></span>';
      if (x.m) h += '<span class="seg-m' + (x.y ? '' : ' solo') + '" style="height:' + (x.m * U).toFixed(1) + 'px"></span>';
      h += '</div>';
    });
    h += '</div></div><div class="xlabels" style="margin-right:0" aria-hidden="true">';
    data.forEach((x, i) => { h += '<span' + (i === data.length - 1 ? ' class="cur"' : '') + '>' + esc(monthLong(x.d)) + '</span>'; });
    h += '</div></section>';
    return h;
  }

  function prayerBreakdown(H) {
    let days = [];
    let label;
    const comp = H.completed.slice(0, 8);
    if (comp.length) {
      comp.forEach((x) => { for (let i = 0; i < 7; i++) days.push(addDays(x.w, i)); });
      label = comp.length === 1 ? 'השבוע שעבר' : comp.length + ' שבועות שהסתיימו';
    } else {
      for (let i = 0; i <= H.today.getDay(); i++) days.push(addDays(H.cur, i));
      label = 'השבוע עד היום';
    }
    const total = days.length;
    const rows = PRAYERS.map((n, p) => {
      let c = 0, cm = 0;
      days.forEach((d) => { const s = dayMarks(keyOf(d))[p]; if (s === 'm' || s === 'y') c++; if (s === 'm') cm++; });
      return { n: n, p: p, c: c, cm: cm, pct: total ? Math.round((c / total) * 100) : 0 };
    });
    let h = '<section class="card" style="margin-top:14px" aria-label="לפי תפילה"><div class="card-head"><h2>לפי תפילה</h2><span class="meta">' + label + '</span></div><div style="margin-top:12px">';
    rows.forEach((r) => {
      h += '<div class="prow"><span class="pn">' + r.n + '</span><div class="pt"><i style="width:' + r.pct + '%"></i></div><span class="pv">' + r.c + '/' + total + ' · <b>' + r.pct + '%</b></span></div>';
    });
    h += '</div>';
    const weakest = rows.slice().sort((a, b) => a.pct - b.pct)[0];
    if (weakest.pct < 70) {
      h += '<div class="insight"><span>' + weakest.n + ' היא הנקודה לחיזוק הבא</span><button type="button" class="link-btn" data-action="goto-reminders">תזכורת ל' + weakest.n + '</button></div>';
    } else if (rows.every((r) => r.pct >= 85)) {
      h += '<div class="insight"><span>כל שלוש התפילות חזקות אצלך. המשך כך!</span></div>';
    }
    h += '</section>';
    return h;
  }

  function placesCard() {
    const counts = {};
    Object.keys(state.places).forEach((k) => {
      const marks = dayMarks(k);
      state.places[k].forEach((pl, p) => { if (pl && (marks[p] === 'm' || marks[p] === 'y')) counts[pl] = (counts[pl] || 0) + 1; });
    });
    const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 4);
    if (!top.length) return '';
    let h = '<section class="card" style="margin-top:14px" aria-label="מקומות"><div class="card-head"><h2>איפה התפללת</h2><span class="meta">כל הזמן</span></div><div class="chips" style="margin-top:12px">';
    top.forEach((pl) => { h += '<span class="chip">' + esc(pl) + ' <b class="ltr">' + counts[pl] + '</b></span>'; });
    return h + '</div></section>';
  }

  function weeksList(H) {
    const list = H.weeks.slice(0, 12);
    let h = '<section class="card" style="margin-top:14px" aria-label="רשימת שבועות"><div class="card-head"><h2>שבוע אחרי שבוע</h2><span class="meta">לחץ לפתיחה</span></div><div class="wlist" style="margin-top:6px">';
    list.forEach((w) => {
      const s = weekStats(w);
      const cur = sameDay(w, H.cur);
      const ok = met(s);
      h += '<button type="button" class="wrow" data-action="open-week" data-date="' + keyOf(w) + '">' +
        '<span class="badge ' + (ok ? 'ok' : 'no') + '">' + (ok ? svg('check', 13, 3) : '') + '</span>' +
        '<span class="wr-main"><b>' + (cur ? 'השבוע · ' : '') + esc(gregRange(w)) + '</b><span>' + esc(hebRange(w)) + '</span></span>' +
        '<span class="wr-vals"><b class="g">' + s.m + '</b> במניין · <b class="s">' + s.t + '</b> סה״כ</span></button>';
    });
    return h + '</div></section>';
  }

  // ================= Settings =================
  function viewSettings() {
    const s = state.settings;
    const g = goals();
    const city = cityById(s.city);
    const native = isNative();
    let h = '<header class="top"><h1 style="margin:0">הגדרות</h1></header>';

    h += '<section class="card" style="margin-top:14px" aria-label="יעדים שבועיים"><div class="card-head"><h2>יעדים שבועיים</h2></div>' +
      '<p class="note" style="margin-top:2px">מתוך 21 תפילות בשבוע (3 ביום × 7)</p>' + goalsHtml(g) + '</section>';

    // reminders
    h += '<section class="card" id="reminders" style="margin-top:14px" aria-label="תזכורות"><div class="card-head"><h2>תזכורות</h2>';
    if (native && ui.perm) {
      h += ui.perm === 'granted' ? '<span class="status-pill ok">התראות פעילות</span>' : '<span class="status-pill bad">התראות כבויות</span>';
    }
    h += '</div>';
    if (!native) h += '<p class="note">התזכורות פועלות באפליקציה המותקנת בטלפון.</p>';
    if (native && ui.perm && ui.perm !== 'granted') {
      h += '<div style="margin-top:10px"><button type="button" class="btn gold" style="width:100%" data-action="perm-request">' + svg('bell', 18) + 'אישור התראות</button></div>';
    }
    if (native && ui.exact === 'denied') {
      h += '<div style="margin-top:10px"><button type="button" class="btn" style="width:100%" data-action="exact-request">אישור תזכורות בזמן מדויק</button></div>';
    }

    h += '<div class="set-row"><div class="sr-main"><b>סיכום לילי</b><span>מה התפללת היום ומה חסר, עם כפתורי סימון</span></div>' +
      timeField(s.nightly.time, 'data-change="nightly-time"', 'שעת הסיכום הלילי', !s.nightly.on) +
      switchHtml('nightly.on', s.nightly.on, 'סיכום לילי') + '</div>';

    PKEYS.forEach((pk, p) => {
      const r = s.reminders[pk];
      h += '<div class="set-block"><div class="set-row"><div class="sr-main"><b>תזכורת ל' + PRAYERS[p] + '</b><span>' +
        (r.on ? (r.times.length ? r.times.length + ' ביום · רק אם עוד לא סימנת' : 'אין שעות. הוסף שעה') : 'כבויה') + '</span></div>' +
        switchHtml('reminders.' + pk + '.on', r.on, 'תזכורת ל' + PRAYERS[p]) + '</div>';
      if (r.on) {
        h += '<div class="chips">';
        r.times.forEach((t, i) => {
          h += '<span class="chip time"><span class="ltr">' + t + '</span><button type="button" class="rm" data-action="remove-time" data-pk="' + pk + '" data-i="' + i + '" aria-label="הסרת השעה ' + t + '">' + svg('x', 14, 2.4) + '</button></span>';
        });
        if (r.times.length < MAX_TIMES) h += '<button type="button" class="chip" data-action="add-time-toggle" data-pk="' + pk + '">' + svg('plus', 14, 2.4) + 'שעה</button>';
        h += '</div>';
        if (ui.addTime === pk) {
          h += '<div class="inline-add">' + timeField(suggestTime(pk), 'id="new-time"', 'שעה חדשה ל' + PRAYERS[p], false) +
            '<button type="button" class="btn gold" data-action="add-time-save" data-pk="' + pk + '">הוספה</button>' +
            '<button type="button" class="btn ghost" data-action="add-time-toggle" data-pk="' + pk + '">ביטול</button></div>';
        }
      }
      h += '</div>';
    });

    const ss = sunset(todayDate(), city);
    h += '<div class="set-row"><div class="sr-main"><b>מנחה לפני השקיעה</b><span>כמה דקות לפני. השקיעה היום ב' + city.name + ': <span class="ltr">' + (ss ? hhmm(ss) : '—') + '</span></span></div>' +
      '<select class="sel" style="max-width:96px" data-change="mincha-minutes" aria-label="כמה דקות לפני השקיעה"' + (s.mincha.on ? '' : ' disabled') + '>' +
      MINCHA_OPTIONS.map((m) => '<option value="' + m + '"' + (m === s.mincha.minutes ? ' selected' : '') + '>' + m + ' דק׳</option>').join('') + '</select>' +
      switchHtml('mincha.on', s.mincha.on, 'תזכורת מנחה לפני השקיעה') + '</div>';

    h += '<div class="set-row"><div class="sr-main"><b>שקט בשבת ובחג</b><span>בלי התראות מלפני כניסת שבת או חג ועד צאתם</span></div>' +
      switchHtml('shabbatQuiet', s.shabbatQuiet, 'שקט בשבת ובחג') + '</div>';

    h += '<div class="set-row"><div class="sr-main"><b>העיר שלך</b><span>לזמני שקיעה ושבת</span></div><select class="sel" data-change="city" aria-label="העיר שלך">' +
      CITIES.map((c) => '<option value="' + c.id + '"' + (c.id === s.city ? ' selected' : '') + '>' + c.name + '</option>').join('') + '</select></div>';

    if (native) {
      h += '<div style="margin-top:6px"><button type="button" class="btn" style="width:100%" data-action="test-notif">' + svg('bell', 18) + 'שליחת התראת ניסיון</button></div>' +
        '<p class="note">אם התזכורות לא מגיעות: בהגדרות הטלפון ← אפליקציות ← תפילתי ← סוללה, בחר "ללא הגבלה".</p>';
    }
    h += '</section>';

    // places
    h += '<section class="card" style="margin-top:14px" aria-label="מקומות תפילה"><div class="card-head"><h2>מקומות תפילה</h2><span class="meta">לבחירה בזמן הסימון</span></div><div class="chips" style="margin-top:12px">';
    s.placeList.forEach((pl, i) => {
      h += '<span class="chip">' + esc(pl) + '<button type="button" class="rm" data-action="remove-place" data-i="' + i + '" aria-label="הסרת ' + esc(pl) + '">' + svg('x', 14, 2.4) + '</button></span>';
    });
    h += '</div>';
    if (s.placeList.length < 12) {
      h += '<div class="inline-add"><input type="text" class="text-in" id="set-new-place" maxlength="40" placeholder="מקום חדש, למשל: ישיבה" data-enter="set-add-place" aria-label="מקום חדש">' +
        '<button type="button" class="btn" data-action="set-add-place">הוספה</button></div>';
    }
    h += '</section>';

    // general
    h += '<section class="card" style="margin-top:14px" aria-label="כללי"><div class="set-row" style="min-height:52px"><div class="sr-main"><b>רטט בסימון</b></div>' + switchHtml('haptics', s.haptics, 'רטט בסימון') + '</div></section>';

    // data
    h += '<section class="card" style="margin-top:14px" aria-label="הנתונים שלך"><div class="card-head"><h2>הנתונים שלך</h2></div>' +
      '<p class="note">נשמרים רק אצלך בטלפון, בלי חשבון ובלי שרת. כדאי לגבות מדי פעם.</p>' +
      '<div class="grid2"><button type="button" class="btn" data-action="backup">' + svg('download', 16) + 'גיבוי לקובץ</button>' +
      '<button type="button" class="btn" data-action="restore">' + svg('upload', 16) + 'שחזור מגיבוי</button></div>' +
      '<button type="button" class="btn danger" style="width:100%;margin-top:10px" data-action="reset">' + svg('trash', 16) + 'מחיקת כל הסימונים</button></section>';

    h += '<p class="about">תפילתי · גרסה <span class="ltr">' + APP_VERSION + '</span></p>';
    return h;
  }

  function goalsHtml(g) {
    const row = (label, key, v, dotStyle) => '<div class="set-row" style="min-height:56px"><div class="sr-main"><b style="display:flex;align-items:center;gap:8px"><i class="dot" style="' + dotStyle + ';width:10px;height:10px"></i>' + label + '</b></div>' +
      '<div class="stepper"><button type="button" class="icon-btn" data-action="goal" data-g="' + key + '" data-d="1" aria-label="הגדלת ' + label + '"' + (v >= 21 ? ' disabled' : '') + '>' + svg('plus', 18, 2.4) + '</button>' +
      '<span class="v" aria-live="polite">' + v + '</span>' +
      '<button type="button" class="icon-btn" data-action="goal" data-g="' + key + '" data-d="-1" aria-label="הקטנת ' + label + '"' + (v <= 1 ? ' disabled' : '') + '>' + svg('minus', 18, 2.4) + '</button></div></div>';
    return row('במניין', 'm', g.m, 'background:#F2C14E') + row('סה״כ תפילות', 't', g.t, 'border:2px solid #7FB2FF;background:transparent');
  }

  /** A 24h time picker: our own label on top, the native picker underneath (opens on tap). */
  function timeField(value, attrs, label, disabled) {
    return '<label class="time-pick' + (disabled ? ' disabled' : '') + '"><span class="tp-val">' + value + '</span>' + svg('clock', 16) +
      '<input type="time" class="tp-in" ' + attrs + ' value="' + value + '" aria-label="' + esc(label) + '"' + (disabled ? ' disabled' : '') + '></label>';
  }

  function suggestTime(pk) {
    const r = state.settings.reminders[pk];
    const base = { s: '07:00', m: '13:30', a: '20:00' }[pk];
    if (r.times.indexOf(base) < 0) return base;
    const last = r.times[r.times.length - 1].split(':').map(Number);
    const mins = Math.min(23 * 60 + 30, last[0] * 60 + last[1] + 30);
    return pad(Math.floor(mins / 60)) + ':' + pad(mins % 60);
  }

  // ================= Sheet =================
  function openSheet(dateKey, p, trigger) {
    ui.sheet = { date: dateKey, p: p, place: dayPlaces(dateKey)[p] || '' };
    ui.addPlace = false;
    ui.lastFocus = trigger || null;
    renderSheet(true);
  }
  function renderSheet(animateIn) {
    const root = $('#sheet-root');
    const sh = ui.sheet;
    if (!sh) { root.innerHTML = ''; return; }
    const d = parseKey(sh.date);
    const isToday = sameDay(d, todayDate());
    const cur = dayMarks(sh.date)[sh.p];
    const opts = [
      { k: 'm', title: 'במניין', desc: 'נספר ליעד המניין וגם לסה״כ', ic: 'users' },
      { k: 'y', title: 'ביחיד', desc: 'נספר ליעד הסה״כ', ic: 'user' },
      { k: 'x', title: 'לא התפללתי', desc: 'זה בסדר. מחר יום חדש', ic: 'x' }
    ];
    let h = '<div class="sheet-wrap' + (animateIn ? '' : ' open') + '"><div class="backdrop" data-action="close-sheet"></div>' +
      '<section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"><div class="handle"></div>' +
      '<div class="sheet-head"><span class="p-icon">' + svg(PICONS[sh.p], 26) + '</span><div class="info"><div>יום ' + DAY_NAMES[d.getDay()] + ' · ' + esc(hebDate(d, false)) + (isToday ? ' · היום' : '') + '</div>' +
      '<h2 id="sheet-title">' + PRAYERS[sh.p] + '</h2></div>' +
      '<button type="button" class="icon-btn" data-action="close-sheet" aria-label="סגירה">' + svg('x', 18, 2.4) + '</button></div>';

    h += '<h3>איך התפללת?</h3><div class="opts">';
    opts.forEach((o) => {
      const on = cur === o.k;
      h += '<button type="button" class="opt k-' + o.k + (on ? ' on' : '') + '" data-action="set-status" data-s="' + o.k + '" aria-pressed="' + on + '">' +
        '<span class="o-icon">' + svg(o.ic, 22, 2.2) + '</span><span class="o-text"><b>' + o.title + '</b><span>' + o.desc + '</span></span>' +
        '<span class="radio">' + (on ? svg('check', 14, 3.2).replace('currentColor', '#1A1406') : '') + '</span></button>';
    });
    h += '</div>';

    h += '<h3>איפה? <small>(לא חובה, בחר לפני הסימון)</small></h3><div class="chips">';
    state.settings.placeList.forEach((pl, i) => {
      h += '<button type="button" class="chip' + (sh.place === pl ? ' on' : '') + '" data-action="pick-place" data-i="' + i + '" aria-pressed="' + (sh.place === pl) + '">' + esc(pl) + '</button>';
    });
    if (sh.place && state.settings.placeList.indexOf(sh.place) < 0) {
      h += '<button type="button" class="chip on" data-action="pick-place" data-i="-2" aria-pressed="true">' + esc(sh.place) + '</button>';
    }
    h += '<button type="button" class="chip" data-action="sheet-add-toggle">' + svg('plus', 14, 2.4) + 'מקום אחר</button></div>';
    if (ui.addPlace) {
      h += '<div class="inline-add"><input type="text" class="text-in" id="sheet-new-place" maxlength="40" placeholder="שם המקום" data-enter="sheet-add-place" aria-label="שם המקום">' +
        '<button type="button" class="btn" data-action="sheet-add-place">הוספה</button></div>';
    }

    h += '<div class="sheet-foot">';
    if (cur) h += '<button type="button" class="link-btn" data-action="set-status" data-s="" style="color:#C9CDE3">הסרת הסימון</button>';
    h += '<p>לחיצה על אפשרות שומרת מיד</p></div></section></div>';
    root.innerHTML = h;
    if (animateIn) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const w = root.firstElementChild;
        if (w) w.classList.add('open');
        const first = root.querySelector('.opt.on') || root.querySelector('.opt');
        if (first) first.focus({ preventScroll: true });
      }));
    }
    if (ui.addPlace) { const inp = $('#sheet-new-place'); if (inp) inp.focus(); }
  }
  function closeSheet() {
    const root = $('#sheet-root');
    const w = root.firstElementChild;
    ui.sheet = null;
    ui.addPlace = false;
    if (w) {
      w.classList.remove('open');
      setTimeout(() => { if (!ui.sheet) root.innerHTML = ''; }, 300);
    }
    const f = ui.lastFocus;
    ui.lastFocus = null;
    if (f && document.body.contains(f)) { try { f.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  }

  // ================= Marking =================
  function applyMark(dateKey, p, s, place) {
    const arr = dayMarks(dateKey).slice();
    arr[p] = s;
    if (arr.some(Boolean)) state.marks[dateKey] = arr; else delete state.marks[dateKey];
    const pl = dayPlaces(dateKey).slice();
    pl[p] = (s === 'm' || s === 'y') && place ? place : '';
    if (pl.some(Boolean)) state.places[dateKey] = pl; else delete state.places[dateKey];
  }
  function setMark(dateKey, p, s, place) {
    if (!KEY_RE.test(dateKey) || !(p >= 0 && p <= 2)) return;
    const d = parseKey(dateKey);
    if (d > todayDate()) return;
    const ws = startOfWeek(d);
    const prevS = dayMarks(dateKey)[p];
    const prevPlace = dayPlaces(dateKey)[p];
    const prevDay = dayMarks(dateKey).slice();
    const b = weekStats(ws);
    applyMark(dateKey, p, s, place);
    saveState();
    const a = weekStats(ws);
    haptic('light');
    renderScreen();
    scheduleSoon();
    const undo = { dateKey: dateKey, p: p, s: prevS, place: prevPlace };
    if (celebrateCheck(ws, b, a)) return;
    feedbackToast(dateKey, p, s, prevDay, b, a, undo);
  }
  function feedbackToast(dateKey, p, s, prevDay, b, a, undo) {
    const g = goals();
    const nowDay = dayMarks(dateKey);
    const progress = a.m + '/' + g.m + ' במניין · ' + a.t + '/' + g.t + ' סה״כ';
    if (!s) return toast({ title: 'הסימון הוסר', sub: progress, icon: 'x', tone: 'muted', undo: undo });
    if (s === 'x') return toast({ title: PRAYERS[p] + ' · נרשם', sub: 'מחר יום חדש. ' + progress, icon: 'x', tone: 'muted', undo: undo });
    if (prayedCount(nowDay) === 3 && prayedCount(prevDay) < 3) return toast({ title: 'יום מלא! 3 מתוך 3', sub: 'יישר כוח · ' + progress, icon: 'sparkle', undo: undo });
    const half = Math.ceil(g.m / 2);
    if (g.m >= 4 && b.m < half && a.m >= half && a.m < g.m) return toast({ title: 'חצי דרך ליעד המניין', sub: progress, icon: 'users', undo: undo });
    return toast({ title: PRAYERS[p] + ' ' + ST_LABEL[s] + ' ✓', sub: progress, icon: s === 'm' ? 'users' : 'user', tone: s === 'm' ? 'gold' : 'sky', undo: undo });
  }
  function celebrateCheck(ws, b, a) {
    const g = goals();
    const wk = keyOf(ws);
    const c = state.celebrated[wk] || { m: false, t: false };
    const hitM = b.m < g.m && a.m >= g.m && !c.m;
    const hitT = b.t < g.t && a.t >= g.t && !c.t;
    if (!hitM && !hitT) return false;
    if (hitM) c.m = true;
    if (hitT) c.t = true;
    state.celebrated[wk] = c;
    saveState();
    const both = a.m >= g.m && a.t >= g.t;
    showCelebration({ kind: both ? 'both' : (hitM ? 'm' : 't'), ws: ws, stats: a });
    return true;
  }
  function undoMark() {
    const u = ui.undo;
    if (!u) return;
    ui.undo = null;
    applyMark(u.dateKey, u.p, u.s, u.place);
    saveState();
    renderScreen();
    scheduleSoon();
    toast({ title: 'בוטל', sub: 'הסימון חזר למה שהיה', icon: 'check', tone: 'muted' });
  }

  // ================= Toast =================
  let toastTimer = null;
  function toast(o) {
    const root = $('#toast-root');
    const tone = o.tone || 'gold';
    root.innerHTML = '<div class="toast"><span class="t-icon ' + (tone === 'gold' ? '' : tone) + '">' + svg(o.icon || 'check', 18, 2.4) + '</span>' +
      '<div class="t-body"><b>' + esc(o.title) + '</b>' + (o.sub ? '<span>' + esc(o.sub) + '</span>' : '') + '</div>' +
      (o.undo ? '<button type="button" class="undo" data-action="toast-undo">ביטול</button>' : '') + '</div>';
    ui.undo = o.undo || null;
    const el = root.firstElementChild;
    requestAnimationFrame(() => requestAnimationFrame(() => { if (el) el.classList.add('show'); }));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, o.undo ? 5000 : 3200);
  }
  function hideToast() {
    const el = $('#toast-root .toast');
    ui.undo = null;
    if (!el) return;
    el.classList.remove('show');
    setTimeout(() => { if (el.parentNode && !el.classList.contains('show')) el.remove(); }, 280);
  }

  // ================= Celebration =================
  function showCelebration(c) {
    ui.overlay = { type: 'cel', kind: c.kind, ws: c.ws, stats: c.stats, quote: pick(QUOTES), title: pick(c.kind === 'both' ? CHEERS_BOTH : CHEERS_ONE) };
    renderOverlay(true);
    haptic('success');
  }
  function celebrationHtml(o) {
    const g = goals();
    const st = o.stats;
    const today = todayDate();
    const isCurrent = sameDay(o.ws, startOfWeek(today));
    const when = isCurrent ? 'השבוע' : 'בשבוע ' + gregRange(o.ws);
    let medalNum, medalLbl, sky = false, sub, card = '';
    if (o.kind === 't') { medalNum = st.t; medalLbl = 'מתוך ' + g.t + ' בסה״כ'; sky = true; }
    else { medalNum = st.m; medalLbl = 'מתוך ' + g.m + ' במניין'; }
    if (o.kind === 'both') {
      sub = 'עמדת בשני היעדים ' + when + ': ' + st.m + ' במניין ו־' + st.t + ' בסך הכול.';
    } else if (o.kind === 'm') {
      sub = 'עמדת ביעד המניין ' + when + (isCurrent && today.getDay() < 6 ? ', וזה רק יום ' + DAY_NAMES[today.getDay()] + '.' : '.');
      const need = Math.max(0, g.t - st.t);
      card = '<div class="card">' + barRow('יעד הסה״כ', 'sky', st.t, g.t) + '<p class="note" style="color:#C9CDE3">' +
        (need === 1 ? 'עוד תפילה אחת, ושני היעדים בכיס.' : 'עוד ' + need + ' תפילות לסה״כ, ושני היעדים בכיס.') + '</p></div>';
    } else {
      sub = 'עמדת ביעד הסה״כ ' + when + '.';
      const need = Math.max(0, g.m - st.m);
      card = '<div class="card">' + barRow('יעד המניין', 'gold', st.m, g.m) + '<p class="note" style="color:#C9CDE3">' +
        (need === 1 ? 'עוד מניין אחד, ושני היעדים בכיס.' : 'עוד ' + need + ' במניין, ושני היעדים בכיס.') + '</p></div>';
    }
    const sk = streak();
    let conf = '';
    const colors = ['#F2C14E', '#7FB2FF', '#F3EFE6', '#E9D9AE'];
    for (let i = 0; i < 40; i++) {
      conf += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;background:' + colors[i % 4] + ';animation-duration:' + (2.4 + Math.random() * 2.2).toFixed(2) +
        's;animation-delay:' + (Math.random() * 0.8).toFixed(2) + 's;width:' + (5 + Math.round(Math.random() * 4)) + 'px;transform:rotate(' + Math.round(Math.random() * 180) + 'deg)"></i>';
    }
    return '<div class="cel" role="dialog" aria-modal="true" aria-labelledby="cel-title"><div class="confetti" aria-hidden="true">' + conf + '</div><div class="cel-inner">' +
      '<div class="cel-top"><button type="button" class="icon-btn" data-action="cel-close" aria-label="סגירה">' + svg('x', 18, 2.4) + '</button></div>' +
      '<div class="medal-wrap"><div class="ring1"></div><div class="ring2"></div><div class="medal' + (sky ? ' sky' : '') + '">' + svg(sky ? 'sparkle' : 'users', 26, 2.2) +
      '<div class="mn">' + medalNum + '</div><div class="ml">' + medalLbl + '</div></div></div>' +
      '<h1 id="cel-title">' + esc(o.title) + '</h1><p class="sub">' + esc(sub) + '</p>' + card +
      (sk > 0 && o.kind === 'both' ? '<div class="streak">' + svg('flame', 16, 2.2).replace('currentColor', '#F2C14E') + (sk === 1 ? 'השבוע הראשון ביעד' : sk + ' שבועות ברצף') + '</div>' : '') +
      '<figure><blockquote>״' + esc(o.quote.t) + '״</blockquote><figcaption>' + esc(o.quote.s) + '</figcaption></figure>' +
      '<div class="spacer"></div><div class="actions"><button type="button" class="btn gold big" data-action="cel-close">המשך</button>' +
      '<button type="button" class="btn big ghost" style="font-size:15px;height:50px" data-action="cel-share">' + svg('share', 18) + 'שיתוף ההישג</button></div>' +
      '</div></div>';
  }
  function renderOverlay(animateIn) {
    const root = $('#overlay-root');
    const o = ui.overlay;
    if (!o) { root.innerHTML = ''; return; }
    root.innerHTML = o.type === 'cel' ? celebrationHtml(o) : onboardingHtml();
    const el = root.firstElementChild;
    if (animateIn) requestAnimationFrame(() => requestAnimationFrame(() => { if (el) el.classList.add('open'); }));
    else if (el) el.classList.add('open');
    const focusEl = root.querySelector('[data-action="cel-close"].gold, [data-action="onboard-start"]');
    if (animateIn && focusEl) setTimeout(() => focusEl.focus({ preventScroll: true }), 50);
  }
  function closeOverlay() {
    const root = $('#overlay-root');
    const el = root.firstElementChild;
    ui.overlay = null;
    if (el) { el.classList.remove('open'); setTimeout(() => { if (!ui.overlay) root.innerHTML = ''; }, 320); }
  }
  async function shareCelebration() {
    const o = ui.overlay;
    if (!o || o.type !== 'cel') return;
    const st = o.stats;
    const text = 'השבוע התפללתי ' + st.m + ' תפילות במניין ו־' + st.t + ' בסך הכול. ' + o.title + ' (תפילתי)';
    if (isNative()) {
      try { await callRaw('Share', 'share', { text: text, dialogTitle: 'שיתוף ההישג' }); return; } catch (e) { /* fall through */ }
    }
    if (navigator.share) { try { await navigator.share({ text: text }); return; } catch (e) { return; } }
    try { await navigator.clipboard.writeText(text); toast({ title: 'הועתק', sub: 'אפשר להדביק בכל מקום', icon: 'check' }); } catch (e) { /* ignore */ }
  }

  // ================= Onboarding =================
  function onboardingHtml() {
    const s = state.settings;
    const g = goals();
    return '<div class="cel onb" role="dialog" aria-modal="true" aria-labelledby="onb-title"><div class="cel-inner">' +
      '<svg class="logo" viewBox="0 0 150 150" aria-hidden="true"><circle cx="75" cy="75" r="64" fill="none" stroke="#2A2410" stroke-width="12"/><circle cx="75" cy="75" r="64" fill="none" stroke="#F2C14E" stroke-width="12" stroke-linecap="round" transform="rotate(-90 75 75)" stroke-dasharray="300 402"/>' +
      '<circle cx="75" cy="75" r="46" fill="none" stroke="#14233F" stroke-width="12"/><circle cx="75" cy="75" r="46" fill="none" stroke="#7FB2FF" stroke-width="12" stroke-linecap="round" transform="rotate(-90 75 75)" stroke-dasharray="190 289"/></svg>' +
      '<h1 id="onb-title">ברוך הבא לתפילתי</h1>' +
      '<p class="lead">21 תפילות בשבוע. מסמנים בלחיצה, רואים את ההתקדמות, ומקבלים תזכורת לפני השינה.</p>' +
      '<section class="card" aria-label="היעדים שלך"><div class="card-head"><h2>היעדים השבועיים שלך</h2></div>' + goalsHtml(g) + '</section>' +
      '<section class="card" aria-label="תזכורת ועיר">' +
      '<div class="set-row"><div class="sr-main"><b>תזכורת לילית</b><span>אפשר לשנות ולהוסיף תזכורות בהגדרות</span></div>' + timeField(s.nightly.time, 'data-change="nightly-time"', 'שעת התזכורת הלילית', false) + '</div>' +
      '<div class="set-row"><div class="sr-main"><b>העיר שלך</b><span>כדי לשתוק בשבת ובחג</span></div><select class="sel" data-change="city" aria-label="העיר שלך">' +
      CITIES.map((c) => '<option value="' + c.id + '"' + (c.id === s.city ? ' selected' : '') + '>' + c.name + '</option>').join('') + '</select></div></section>' +
      '<div class="spacer"></div><button type="button" class="btn gold big" data-action="onboard-start">בואו נתחיל</button>' +
      '<p class="note" style="text-align:center">הנתונים נשמרים רק אצלך בטלפון.</p></div></div>';
  }

  // ================= Screen =================
  function renderScreen() {
    if (!state) return;
    const el = $('#screen');
    el.innerHTML = ui.tab === 'home' ? viewHome() : ui.tab === 'history' ? viewHistory() : viewSettings();
    document.querySelectorAll('#tabs [data-tab]').forEach((b) => {
      if (b.getAttribute('data-tab') === ui.tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
  }
  function renderAll() {
    renderScreen();
    if (ui.sheet) renderSheet(false);
    if (ui.overlay && ui.overlay.type === 'onb') renderOverlay(false);
  }
  function switchTab(tab, weekStart) {
    ui.tab = tab;
    ui.addTime = null;
    if (weekStart) ui.weekStart = weekStart;
    renderScreen();
    window.scrollTo(0, 0);
    if (tab === 'settings') refreshPermissions();
  }

  // ================= Events =================
  function getPath(path) { return path.split('.').reduce((o, k) => (o == null ? o : o[k]), state.settings); }
  function setPath(path, v) {
    const ks = path.split('.');
    let o = state.settings;
    for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]];
    o[ks[ks.length - 1]] = v;
  }

  function onClick(e) {
    const t = e.target.closest('[data-action]');
    if (!t || t.disabled) return;
    const a = t.getAttribute('data-action');
    const ds = t.dataset;
    switch (a) {
      case 'tab': switchTab(ds.tab, ds.tab === 'home' ? startOfWeek(todayDate()) : null); break;
      case 'week-prev': ui.weekStart = addDays(ui.weekStart, -7); renderScreen(); break;
      case 'week-next': if (ui.weekStart < startOfWeek(todayDate())) { ui.weekStart = addDays(ui.weekStart, 7); renderScreen(); } break;
      case 'week-today': ui.weekStart = startOfWeek(todayDate()); renderScreen(); break;
      case 'open-week': switchTab('home', startOfWeek(parseKey(ds.date))); break;
      case 'mark': openSheet(ds.date, +ds.p, t); break;
      case 'close-sheet': closeSheet(); break;
      case 'set-status': {
        const sh = ui.sheet;
        if (!sh) break;
        const s = ds.s || '';
        const place = sh.place;
        closeSheet();
        setMark(sh.date, sh.p, s, place);
        break;
      }
      case 'pick-place': {
        if (!ui.sheet) break;
        const i = +ds.i;
        const pl = i >= 0 ? state.settings.placeList[i] : (i === -2 ? '' : '');
        ui.sheet.place = ui.sheet.place === pl ? '' : (pl || '');
        renderSheet(false);
        break;
      }
      case 'sheet-add-toggle': ui.addPlace = !ui.addPlace; renderSheet(false); break;
      case 'sheet-add-place': addPlaceFrom('#sheet-new-place', true); break;
      case 'set-add-place': addPlaceFrom('#set-new-place', false); break;
      case 'remove-place': {
        const i = +ds.i;
        state.settings.placeList.splice(i, 1);
        saveState(); renderScreen();
        break;
      }
      case 'dismiss-summary': state.lastSummary = ds.week; saveState(); renderScreen(); break;
      case 'hist-mode': ui.histMode = ds.mode === 'months' ? 'months' : 'weeks'; renderScreen(); break;
      case 'goto-reminders': switchTab('settings'); setTimeout(() => { const r = $('#reminders'); if (r) r.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60); break;
      case 'goal': {
        const s = state.settings;
        const d = +ds.d;
        if (ds.g === 'm') { s.goalMinyan = clamp(s.goalMinyan + d, 1, 21); if (s.goalTotal < s.goalMinyan) s.goalTotal = s.goalMinyan; }
        else { s.goalTotal = clamp(s.goalTotal + d, 1, 21); if (s.goalMinyan > s.goalTotal) s.goalMinyan = s.goalTotal; }
        saveState(); renderAll(); scheduleSoon();
        break;
      }
      case 'toggle': {
        const p = ds.path;
        setPath(p, !getPath(p));
        if (p === 'mincha.on' || p === 'nightly.on' || /^reminders\./.test(p)) ui.addTime = null;
        saveState(); renderScreen(); scheduleSoon();
        if (getPath(p) && /(nightly|reminders|mincha)/.test(p)) ensurePermission();
        break;
      }
      case 'add-time-toggle': ui.addTime = ui.addTime === ds.pk ? null : ds.pk; renderScreen(); if (ui.addTime) { const i = $('#new-time'); if (i) i.focus(); } break;
      case 'add-time-save': {
        const inp = $('#new-time');
        const v = inp ? inp.value : '';
        if (!TIME_RE.test(v)) { toast({ title: 'שעה לא תקינה', icon: 'x', tone: 'muted' }); break; }
        const r = state.settings.reminders[ds.pk];
        if (r.times.indexOf(v) >= 0) { toast({ title: 'השעה הזו כבר קיימת', icon: 'check', tone: 'muted' }); break; }
        r.times = cleanTimes(r.times.concat([v]), r.times);
        ui.addTime = null;
        saveState(); renderScreen(); scheduleSoon();
        toast({ title: 'נוספה תזכורת ל' + PRAYERS[PKEYS.indexOf(ds.pk)], sub: 'בשעה ' + v, icon: 'bell' });
        break;
      }
      case 'remove-time': {
        const r = state.settings.reminders[ds.pk];
        r.times.splice(+ds.i, 1);
        saveState(); renderScreen(); scheduleSoon();
        break;
      }
      case 'perm-request': requestPermission(); break;
      case 'exact-request': call('LocalNotifications', 'changeExactNotificationSetting').then(refreshPermissions); break;
      case 'test-notif': testNotification(); break;
      case 'backup': doBackup(); break;
      case 'restore': { const f = $('#import-file'); f.value = ''; f.click(); break; }
      case 'reset': doReset(); break;
      case 'toast-undo': undoMark(); break;
      case 'cel-close': closeOverlay(); break;
      case 'cel-share': shareCelebration(); break;
      case 'onboard-start': finishOnboarding(); break;
      default: break;
    }
  }
  function addPlaceFrom(sel, inSheet) {
    const inp = $(sel);
    const v = cleanText(inp ? inp.value : '');
    if (!v) { if (inp) inp.focus(); return; }
    const list = state.settings.placeList;
    if (list.indexOf(v) < 0) { if (list.length >= 12) list.shift(); list.push(v); }
    saveState();
    if (inSheet && ui.sheet) { ui.sheet.place = v; ui.addPlace = false; renderSheet(false); }
    else renderScreen();
  }

  function syncTimeLabel(t) {
    if (!t || !t.classList || !t.classList.contains('tp-in')) return;
    const lbl = t.parentNode && t.parentNode.querySelector('.tp-val');
    if (lbl && TIME_RE.test(t.value)) lbl.textContent = t.value;
  }
  function onInput(e) { syncTimeLabel(e.target); }
  function onPickerClick(e) {
    const t = e.target;
    if (!t || !t.classList || !t.classList.contains('tp-in') || t.disabled || isNative()) return;
    if (typeof t.showPicker === 'function') { try { t.showPicker(); } catch (err) { /* ignore */ } }
  }

  function onChange(e) {
    const t = e.target;
    if (t.id === 'import-file') { importFile(t.files && t.files[0]); return; }
    syncTimeLabel(t);
    const c = t.getAttribute('data-change');
    if (!c) return;
    const s = state.settings;
    if (c === 'nightly-time') { if (TIME_RE.test(t.value)) { s.nightly.time = t.value; saveState(); scheduleSoon(); } else t.value = s.nightly.time; }
    else if (c === 'mincha-minutes') { const v = +t.value; if (MINCHA_OPTIONS.indexOf(v) >= 0) { s.mincha.minutes = v; saveState(); scheduleSoon(); } }
    else if (c === 'city') { if (CITIES.some((x) => x.id === t.value)) { s.city = t.value; saveState(); scheduleSoon(); if (ui.tab === 'settings' && !ui.overlay) renderScreen(); } }
  }
  function onKey(e) {
    if (e.key === 'Escape') { if (ui.overlay && ui.overlay.type === 'cel') closeOverlay(); else if (ui.sheet) closeSheet(); return; }
    if (e.key === 'Enter' && e.target && e.target.getAttribute) {
      const act = e.target.getAttribute('data-enter');
      if (act === 'set-add-place') { e.preventDefault(); addPlaceFrom('#set-new-place', false); }
      else if (act === 'sheet-add-place') { e.preventDefault(); addPlaceFrom('#sheet-new-place', true); }
    }
  }

  function onBack() {
    if (ui.overlay && ui.overlay.type === 'cel') { closeOverlay(); return; }
    if (ui.overlay && ui.overlay.type === 'onb') { call('App', 'minimizeApp'); return; }
    if (ui.sheet) { closeSheet(); return; }
    if (ui.tab !== 'home') { switchTab('home', startOfWeek(todayDate())); return; }
    if (!sameDay(ui.weekStart, startOfWeek(todayDate()))) { ui.weekStart = startOfWeek(todayDate()); renderScreen(); return; }
    call('App', 'minimizeApp');
  }

  function checkDayChange() {
    if (!state) return;
    const k = keyOf(todayDate());
    if (k === ui.todayKey) return;
    const prevWs = startOfWeek(parseKey(ui.todayKey));
    const wasCurrent = sameDay(ui.weekStart, prevWs);
    ui.todayKey = k;
    if (wasCurrent) ui.weekStart = startOfWeek(todayDate());
    renderScreen();
    scheduleSoon();
  }
  function onResume() {
    checkDayChange();
    scheduleSoon();
    if (ui.tab === 'settings') refreshPermissions();
  }

  // ================= Onboarding / permissions =================
  function showOnboarding() { ui.overlay = { type: 'onb' }; renderOverlay(true); }
  async function finishOnboarding() {
    state.settings.onboarded = true;
    saveState();
    closeOverlay();
    if (isNative()) await requestPermission();
    toast({ title: 'מתחילים!', sub: 'לחץ על תפילה כדי לסמן אותה', icon: 'sparkle' });
  }
  async function refreshPermissions() {
    if (!isNative()) return;
    const p = await call('LocalNotifications', 'checkPermissions');
    const ex = await call('LocalNotifications', 'checkExactNotificationSetting');
    const perm = p && p.display ? p.display : null;
    const exact = ex && ex.exact_alarm ? ex.exact_alarm : null;
    if (perm !== ui.perm || exact !== ui.exact) {
      ui.perm = perm;
      ui.exact = exact;
      if (ui.tab === 'settings') renderScreen();
    }
  }
  async function requestPermission() {
    if (!isNative()) return;
    const r = await call('LocalNotifications', 'requestPermissions');
    await refreshPermissions();
    if (r && r.display === 'granted') { clearTimeout(schedTimer); await runReschedule(); }
    else if (r) toast({ title: 'ההתראות כבויות', sub: 'אפשר להפעיל אותן בהגדרות', icon: 'bell', tone: 'muted' });
  }
  async function ensurePermission() {
    if (!isNative()) return;
    const p = await call('LocalNotifications', 'checkPermissions');
    if (p && p.display && p.display !== 'granted') await requestPermission();
  }

  // ================= Notifications =================
  let notifSetup = false;
  async function setupNotifications() {
    if (notifSetup) return;
    notifSetup = true;
    await call('LocalNotifications', 'createChannel', {
      id: CHANNEL, name: 'תזכורות תפילה', description: 'תזכורות לתפילה וסיכום לילי', importance: 4, visibility: 1, vibration: true
    });
    await call('LocalNotifications', 'registerActionTypes', {
      types: PRAYERS.map((n, p) => ({ id: 'PRAY_' + p, actions: [{ id: 'm', title: n + ' במניין' }, { id: 'y', title: n + ' ביחיד' }] }))
    });
  }

  function progressLine(d) {
    const g = goals();
    const st = weekStats(startOfWeek(d));
    return 'השבוע: ' + st.m + '/' + g.m + ' במניין · ' + st.t + '/' + g.t + ' סה״כ';
  }
  function joinNames(ps) {
    const n = ps.map((p) => PRAYERS[p]);
    if (n.length <= 1) return n.join('');
    return n.slice(0, -1).join(', ') + ' ו' + n[n.length - 1];
  }
  function nightlyContent(d, isToday) {
    const key = keyOf(d);
    const marks = dayMarks(key);
    if (d.getDay() === 6) {
      return { title: 'שבוע טוב!', body: 'זה הזמן לסמן את תפילות השבת. ' + progressLine(d), extra: { kind: 'nightly', date: key } };
    }
    const dayName = DAY_NAMES[d.getDay()];
    if (isToday) {
      const missing = [0, 1, 2].filter((p) => !marks[p]);
      if (!missing.length) {
        const c = prayedCount(marks);
        return { title: c === 3 ? 'יום מלא! 3 מתוך 3' : 'לילה טוב', body: progressLine(d), extra: { kind: 'nightly', date: key } };
      }
      const last = missing[missing.length - 1];
      const verb = missing.length === 1 ? ' עוד לא סומנה.' : ' עוד לא סומנו.';
      return {
        title: 'סיכום יום ' + dayName,
        body: 'סימנת היום ' + (3 - missing.length) + ' מתוך 3. ' + joinNames(missing) + verb + ' ' + progressLine(d),
        actionTypeId: 'PRAY_' + last,
        extra: { kind: 'nightly', date: key, p: last }
      };
    }
    return { title: 'סיכום יום ' + dayName, body: 'מה התפללת היום? כדאי לסמן לפני השינה.', actionTypeId: 'PRAY_2', extra: { kind: 'nightly', date: key, p: 2 } };
  }

  /** Builds the full list of local notifications for the next 14 days. Pure (depends on state + now). */
  function buildSchedule(now) {
    const s = state.settings;
    const city = cityById(s.city);
    const out = [];
    const today = dateOnly(now);
    for (let i = 0; i < 14; i++) {
      const d = addDays(today, i);
      const key = keyOf(d);
      const marks = dayMarks(key);
      let slot = 0;
      const push = (at, n) => {
        if (!at || isNaN(at.getTime())) return;
        if (at.getTime() <= now.getTime() + 15e3) return;
        if (s.shabbatQuiet && inQuiet(at, city)) return;
        if (slot >= 20) return;
        n.id = 1000 + i * 20 + slot;
        slot++;
        n.schedule = { at: at, allowWhileIdle: true };
        n.channelId = CHANNEL;
        n.smallIcon = 'ic_stat_tfilati';
        n.iconColor = '#F2C14E';
        out.push(n);
      };
      PKEYS.forEach((pk, p) => {
        const r = s.reminders[pk];
        if (!r.on || marks[p]) return;
        r.times.forEach((t) => {
          push(atTime(d, t), {
            title: 'זמן ' + PRAYERS[p],
            body: i === 0 ? progressLine(d) : 'אחרי התפילה, סמן בלחיצה.',
            actionTypeId: 'PRAY_' + p,
            extra: { kind: 'prayer', date: key, p: p }
          });
        });
      });
      if (s.mincha.on && !marks[1]) {
        const ss = sunset(d, city);
        if (ss) {
          push(new Date(ss.getTime() - s.mincha.minutes * 60e3), {
            title: 'השקיעה מתקרבת',
            body: 'עוד ' + s.mincha.minutes + ' דקות לשקיעה. מנחה עוד לפניך.',
            actionTypeId: 'PRAY_1',
            extra: { kind: 'prayer', date: key, p: 1 }
          });
        }
      }
      if (s.nightly.on) {
        const tParts = s.nightly.time.split(':').map(Number);
        const at = tParts[0] < 4 ? atTime(addDays(d, 1), s.nightly.time) : atTime(d, s.nightly.time);
        push(at, nightlyContent(d, i === 0));
      }
    }
    return out;
  }

  let schedTimer = null;
  let schedChain = Promise.resolve();
  /** All rescheduling goes through one queue so runs never overlap. */
  function runReschedule() {
    schedChain = schedChain.then(rescheduleAll, rescheduleAll);
    return schedChain;
  }
  function scheduleSoon() {
    if (!isNative()) return;
    clearTimeout(schedTimer);
    schedTimer = setTimeout(runReschedule, 700);
  }
  async function rescheduleAll() {
    if (!isNative() || !state) return;
    const perm = await call('LocalNotifications', 'checkPermissions');
    if (!perm || perm.display !== 'granted') return;
    await setupNotifications();
    const pending = await call('LocalNotifications', 'getPending');
    const ids = pending && Array.isArray(pending.notifications) ? pending.notifications.map((n) => ({ id: +n.id })).filter((n) => n.id < 90000) : [];
    if (ids.length) await call('LocalNotifications', 'cancel', { notifications: ids });
    const list = buildSchedule(new Date());
    if (list.length) await call('LocalNotifications', 'schedule', { notifications: list });
  }
  async function testNotification() {
    const perm = await call('LocalNotifications', 'checkPermissions');
    if (!perm || perm.display !== 'granted') { await requestPermission(); return; }
    await setupNotifications();
    const at = new Date(Date.now() + 5000);
    await call('LocalNotifications', 'schedule', {
      notifications: [{
        id: 99001, title: 'בדיקה · תפילתי', body: 'ככה ייראו התזכורות שלך. אפשר ללחוץ על הכפתורים.',
        schedule: { at: at, allowWhileIdle: true }, channelId: CHANNEL, smallIcon: 'ic_stat_tfilati', iconColor: '#F2C14E',
        actionTypeId: 'PRAY_2', extra: { kind: 'test' }
      }]
    });
    toast({ title: 'ההתראה תגיע בעוד 5 שניות', sub: 'אפשר לצאת מהאפליקציה כדי לראות אותה', icon: 'bell' });
  }

  const pendingActions = [];
  function queueAction(ev) { pendingActions.push(ev); if (state) flushActions(); }
  function flushActions() {
    while (pendingActions.length) handleNotifAction(pendingActions.shift());
  }
  function handleNotifAction(ev) {
    const n = ev && ev.notification ? ev.notification : {};
    const ex = n.extra || {};
    const act = ev ? ev.actionId : '';
    if (ex.kind === 'test') {
      if (act === 'm' || act === 'y') toast({ title: 'הכפתורים עובדים!', sub: 'זו הייתה בדיקה, שום דבר לא נשמר', icon: 'check' });
      return;
    }
    const p = ex.p == null ? null : Number(ex.p);
    const date = typeof ex.date === 'string' && KEY_RE.test(ex.date) ? ex.date : null;
    if ((act === 'm' || act === 'y') && date && p != null && p >= 0 && p <= 2) {
      if (ui.sheet) closeSheet();
      if (ui.overlay && ui.overlay.type === 'cel') closeOverlay();
      ui.tab = 'home';
      ui.weekStart = startOfWeek(parseKey(date));
      setMark(date, p, act, '');
      return;
    }
    if (date) {
      ui.tab = 'home';
      ui.weekStart = startOfWeek(parseKey(date));
      renderScreen();
      if (p != null && p >= 0 && p <= 2 && !dayMarks(date)[p] && !ui.overlay) openSheet(date, p, null);
    }
  }

  // ================= Backup =================
  async function doBackup() {
    const json = JSON.stringify({ app: 'tfilati', version: APP_VERSION, exportedAt: new Date().toISOString(), data: state });
    const name = 'tfilati-backup-' + keyOf(todayDate()) + '.json';
    if (isNative()) {
      const w = await call('Filesystem', 'writeFile', { path: name, data: json, directory: 'CACHE', encoding: 'utf8' });
      if (w && w.uri) {
        try { await callRaw('Share', 'share', { title: 'גיבוי תפילתי', url: w.uri, dialogTitle: 'איפה לשמור את הגיבוי?' }); } catch (e) { /* cancelled */ }
        return;
      }
      toast({ title: 'הגיבוי לא הצליח', sub: 'נסה שוב', icon: 'x', tone: 'muted' });
      return;
    }
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast({ title: 'הגיבוי נשמר', sub: name, icon: 'download' });
  }
  function importFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let obj = null;
      try { obj = JSON.parse(String(reader.result)); } catch (e) { obj = null; }
      const data = obj && obj.app === 'tfilati' && isObj(obj.data) ? obj.data : null;
      if (!data) { toast({ title: 'הקובץ לא מתאים', sub: 'בחר קובץ גיבוי של תפילתי', icon: 'x', tone: 'muted' }); return; }
      const n = isObj(data.marks) ? Object.keys(data.marks).length : 0;
      if (!window.confirm('לשחזר מהגיבוי? יש בו ' + n + ' ימים מסומנים. הנתונים הנוכחיים יוחלפו.')) return;
      state = normalize(data);
      state.settings.onboarded = true;
      saveState();
      ui.weekStart = startOfWeek(todayDate());
      renderScreen();
      scheduleSoon();
      toast({ title: 'השחזור הושלם', sub: n + ' ימים חזרו', icon: 'check' });
    };
    reader.onerror = () => toast({ title: 'לא הצלחתי לקרוא את הקובץ', icon: 'x', tone: 'muted' });
    reader.readAsText(file);
  }
  function doReset() {
    if (!window.confirm('למחוק את כל הסימונים? ההגדרות יישארו. אי אפשר לבטל את זה.')) return;
    state.marks = {};
    state.places = {};
    state.celebrated = {};
    state.lastSummary = '';
    state.createdAt = keyOf(todayDate());
    saveState();
    renderScreen();
    scheduleSoon();
    toast({ title: 'כל הסימונים נמחקו', icon: 'trash', tone: 'muted' });
  }

  // ================= Demo data (?demo=1, not saved) =================
  function demoState() {
    const s = defaults();
    s.settings.onboarded = true;
    const today = todayDate();
    const cur = startOfWeek(today);
    const pattern = [[8, 5], [9, 6], [11, 5], [10, 6], [12, 4], [13, 3], [10, 7]];
    s.createdAt = keyOf(addDays(cur, -7 * pattern.length));
    pattern.forEach((pm, wi) => {
      const ws = addDays(cur, -7 * (pattern.length - wi));
      let m = pm[0], y = pm[1];
      const order = [0, 2, 1];
      for (let i = 0; i < 7; i++) {
        const arr = ['', '', ''];
        order.forEach((p) => { if (m > 0 && (p !== 1 || i % 2 === 0)) { arr[p] = 'm'; m--; } else if (y > 0) { arr[p] = 'y'; y--; } });
        s.marks[keyOf(addDays(ws, i))] = arr;
      }
      s.celebrated[keyOf(ws)] = { m: true, t: true };
    });
    const curPat = [['m', 'y', 'm'], ['m', 'x', 'm'], ['m', 'm', 'y'], ['m', '', ''], ['m', 'm', ''], ['m', '', 'm'], ['', '', '']];
    for (let i = 0; i <= today.getDay(); i++) {
      const arr = curPat[i].slice();
      if (i === today.getDay()) { arr[1] = ''; arr[2] = ''; }
      if (arr.some(Boolean)) s.marks[keyOf(addDays(cur, i))] = arr;
    }
    s.places[keyOf(addDays(cur, -1))] = ['בית הכנסת הקבוע', '', 'בית הכנסת הקבוע'];
    s.lastSummary = keyOf(addDays(cur, -7));
    return s;
  }

  // ================= Init =================
  async function initNative() {
    if (!isNative()) return;
    await listen('LocalNotifications', 'localNotificationActionPerformed', queueAction);
    await listen('App', 'backButton', onBack);
    await listen('App', 'appStateChange', (st) => { if (st && st.isActive) onResume(); });
    call('StatusBar', 'setBackgroundColor', { color: '#0B1026' });
    call('StatusBar', 'setStyle', { style: 'DARK' });
  }

  async function init() {
    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    document.addEventListener('input', onInput);
    document.addEventListener('click', onPickerClick);
    document.addEventListener('keydown', onKey);
    initNative();
    const params = new URLSearchParams(location.search);
    if (params.get('demo') === '1') { ui.demo = true; state = demoState(); }
    else await loadState();
    ui.todayKey = keyOf(todayDate());
    ui.weekStart = startOfWeek(todayDate());
    renderScreen();
    if (!state.settings.onboarded) showOnboarding();
    flushActions();
    scheduleSoon();
    if (isNative()) refreshPermissions();
    setInterval(checkDayChange, 60e3);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) onResume(); });
  }

  // Expose a tiny test surface (used only by automated checks).
  window.__tfilati = {
    get state() { return state; }, set state(v) { state = normalize(v); },
    buildSchedule: (now) => buildSchedule(now), inQuiet: inQuiet, sunset: sunset, nightfall: nightfall, cityById: cityById,
    hebDate: hebDate, gematriya: gematriya, isYomTov: isYomTov, weekStats: weekStats, streak: streak, normalize: normalize,
    setMark: setMark, render: renderScreen, keyOf: keyOf, parseKey: parseKey
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
