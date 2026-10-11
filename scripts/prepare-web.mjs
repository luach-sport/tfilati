// Prepares www/ for packaging: bundles fonts (offline), the Capacitor runtime, and stamps the version.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { build } from 'esbuild';

const root = process.cwd();
const www = join(root, 'www');
const fontsDir = join(www, 'fonts');
mkdirSync(fontsDir, { recursive: true });

// --- Fonts: copy only the weights we use, Hebrew + Latin subsets, woff2 ---
const FONTS = [
  { pkg: '@fontsource/heebo', id: 'heebo', weights: [300, 400, 500, 600, 700, 800] },
  { pkg: '@fontsource/frank-ruhl-libre', id: 'frank', weights: [500, 700, 900] }
];
let css = '';
try {
for (const f of FONTS) {
  const pkgDir = join(root, 'node_modules', f.pkg);
  for (const w of f.weights) {
    const cssPath = join(pkgDir, `${w}.css`);
    if (!existsSync(cssPath)) { console.warn('missing', cssPath); continue; }
    const src = readFileSync(cssPath, 'utf8');
    // keep only hebrew + latin blocks
    const blocks = src.split('/*').map((b) => '/*' + b).filter((b) => /@font-face/.test(b) && /(hebrew|latin)\b/.test(b.split('*/')[0]) && !/latin-ext/.test(b.split('*/')[0]));
    for (const block of blocks) {
      const out = block.replace(/url\(\.\/files\/([^)]+)\)\s*format\('woff'\)/g, '').replace(/,\s*;/g, ';').replace(/url\(\.\/files\/([^)]+\.woff2)\)/g, (m, file) => {
        const dest = join(fontsDir, f.id, file);
        mkdirSync(dirname(dest), { recursive: true });
        copyFileSync(join(pkgDir, 'files', file), dest);
        return `url(./${f.id}/${file})`;
      });
      css += out.trim() + '\n';
    }
  }
}
} catch (e) {
  console.warn('fonts skipped:', e.message);
}
writeFileSync(join(fontsDir, 'fonts.css'), css);
console.log('fonts.css', css.length, 'bytes');

// --- Capacitor runtime ---
await build({
  entryPoints: [join(root, 'scripts', 'cap-entry.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  target: ['chrome89'],
  outfile: join(www, 'cap-runtime.js')
});
console.log('cap-runtime.js built');

// --- Version stamp ---
const version = process.env.APP_VERSION || '1.0.0';
const appPath = join(www, 'app.js');
const app = readFileSync(appPath, 'utf8');
writeFileSync(appPath, app.replace(/const APP_VERSION = '[^']*';/, `const APP_VERSION = '${version}';`));
console.log('version', version);
