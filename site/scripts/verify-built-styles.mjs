import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Catch stale compiled styles before Vercel publishes new markup with old CSS.
async function stylesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) return stylesIn(path);
        return entry.name.endsWith('.css') ? readFile(path, 'utf8') : '';
      }),
    )
  ).join('\n');
}

const css = await stylesIn(
  fileURLToPath(new URL('../.next/static/', import.meta.url)),
);
for (const selector of [
  '.project-logo',
  '--logo-radius',
  '.logo-fallback',
  '.event-backdrop',
  '.event-photo-1',
  '.event-photo-12',
  'event-dissolve',
  '.woki-heading',
  '.signal-route',
  '.sync-status summary',
]) {
  assert.ok(
    css.includes(selector),
    `Build is missing ${selector}; refusing to publish stale CSS`,
  );
}
console.log('Verified compiled logo, collage, radio and sync styles.');
