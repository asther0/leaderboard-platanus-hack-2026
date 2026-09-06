import test from 'node:test';
import assert from 'node:assert/strict';
import { readVotes } from '../lib/projects.ts';
import {
  mergeSnapshot,
  rankOf,
  validSnapshot,
  voteChanges,
} from '../lib/leaderboard.ts';

const project = (slug, votes, stale = false) => ({
  slug,
  name: slug,
  summary: 'Project',
  track: 'Emergencies',
  votes,
  stale,
});
const snapshot = (projects, seconds = 0) => ({
  projects,
  live: projects.every((p) => !p.stale),
  updatedAt: new Date(1_780_000_000_000 + seconds * 1000).toISOString(),
});

test('reads the public structured counter, including zero', () => {
  for (const votes of [0, 27, 1240]) {
    assert.equal(
      readVotes(
        `<script data-page="app" type="application/json">${JSON.stringify({ props: { project: { voteCount: votes } } })}</script>`,
      ),
      votes,
    );
  }
});
test('HTML fallback reads votes; missing or malformed counters remain unknown', () => {
  assert.equal(
    readVotes('<span>votar</span><span class="font-mono">25</span>'),
    25,
  );
  assert.equal(readVotes('<p>Votes unavailable</p>'), null);
  assert.equal(readVotes('<script data-page="app">broken</script>'), null);
  assert.equal(
    readVotes(
      '<script data-page="app">{"props":{"project":{"voteCount":-3}}}</script>',
    ),
    null,
  );
});
test('tied votes share rank; unavailable counts are not treated as zero', () => {
  const projects = [
    project('a', 50),
    project('b', 27),
    project('woki', 27),
    project('c', 0),
    project('d', null),
  ];
  assert.deepEqual(
    projects.map((p) => rankOf(projects, p)),
    [1, 2, 2, 4, null],
  );
});
test('partial failures retain last actual count, flag it stale, and keep the ranking', () => {
  const before = snapshot([project('a', 30), project('woki', 27)]);
  const after = mergeSnapshot(
    before,
    snapshot([project('a', 30), project('woki', null, true)], 15),
  );
  assert.equal(after.projects.find((p) => p.slug === 'woki').votes, 27);
  assert.equal(after.projects.find((p) => p.slug === 'woki').stale, true);
  assert.deepEqual(voteChanges(before, after), {});
});
test('older responses never overwrite newer votes', () => {
  const latest = snapshot([project('woki', 32)], 30);
  assert.equal(
    mergeSnapshot(latest, snapshot([project('woki', 24)], 15)),
    latest,
  );
});
test('a vote increase reorders the ranking and produces a real delta', () => {
  const before = snapshot([project('a', 30), project('woki', 27)]);
  const after = mergeSnapshot(
    before,
    snapshot([project('a', 30), project('woki', 32)], 15),
  );
  assert.equal(after.projects[0].slug, 'woki');
  assert.equal(rankOf(after.projects, after.projects[0]), 1);
  assert.deepEqual(voteChanges(before, after), { woki: 5 });
  assert.deepEqual(voteChanges(after, after), {});
});
test('decreases are reported and recovery from stale reads does not invent a delta', () => {
  assert.deepEqual(
    voteChanges(
      snapshot([project('woki', 27)]),
      snapshot([project('woki', 25)], 15),
    ),
    { woki: -2 },
  );
  assert.deepEqual(
    voteChanges(
      snapshot([project('woki', 27, true)]),
      snapshot([project('woki', 29)], 15),
    ),
    {},
  );
});
test('response validation rejects bad counts and unsafe or duplicate links', () => {
  assert.equal(validSnapshot(snapshot([project('woki', 27)])), true);
  for (const votes of [-1, 2.5, '27', Infinity])
    assert.equal(validSnapshot(snapshot([project('woki', votes)])), false);
  assert.equal(validSnapshot(snapshot([project('../other', 1)])), false);
  assert.equal(
    validSnapshot(snapshot([project('woki', 1), project('woki', 2)])),
    false,
  );
});
