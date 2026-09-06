import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('event slideshow has twelve distinct local JPEGs within its 1 MB budget', async () => {
  const photos = await Promise.all(
    Array.from({ length: 12 }, (_, index) =>
      readFile(
        new URL(`../public/event/hack-${index + 1}.jpg`, import.meta.url),
      ),
    ),
  );
  for (const photo of photos)
    assert.equal(photo.subarray(0, 3).toString('hex'), 'ffd8ff');
  assert.equal(
    new Set(
      photos.map((photo) => createHash('sha256').update(photo).digest('hex')),
    ).size,
    12,
  );
  assert.ok(
    photos.reduce((bytes, photo) => bytes + photo.length, 0) < 1_000_000,
  );
});
