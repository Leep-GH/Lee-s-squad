import { readdirSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const src = resolve('src/remote-ui');
const dest = resolve('dist/remote-ui');

if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
for (const f of readdirSync(src)) {
  copyFileSync(join(src, f), join(dest, f));
}
console.log('Copied remote-ui to dist/');
