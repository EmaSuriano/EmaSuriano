import assert from 'node:assert/strict';
import test from 'node:test';
import { buildReadme, SummarySchema } from './readme';

const createLinks = (prefix: string, amount: number) =>
  Array.from({ length: amount }, (_, index) => ({
    title: `${prefix} ${index + 1}`,
    url: `https://example.com/${prefix.toLowerCase()}-${index + 1}`,
  }));

const summary = {
  name: 'Ema',
  bio: 'Engineer',
  website: 'https://emasuriano.com/',
  projects: createLinks('Project', 5),
  posts: createLinks('Post', 7),
  talks: createLinks('Talk', 2),
};

test('buildReadme orders and limits content without mutating the summary', () => {
  const markdown = buildReadme(summary, '2026-08-24');

  assert.match(markdown, /\[Project 5\]/);
  assert.doesNotMatch(markdown, /\[Project 1\]/);
  assert.match(markdown, /\[Post 6\]/);
  assert.doesNotMatch(markdown, /\[Post 7\]/);
  assert.match(markdown, /Last update: _2026-08-24_/);
  assert.equal(summary.projects[0]?.title, 'Project 1');
});

test('SummarySchema rejects malformed API data', () => {
  assert.throws(() => SummarySchema.parse({ name: 'Ema' }));
});
