import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { Night } from '../src/digest/types.js';

const dir = mkdtempSync(join(tmpdir(), 'rig-routes-'));
const config = {
  adapter: 'shim',
  installed: '2026-10-29T14:06:00+01:00',
  beatEverySeconds: 60,
  runsDir: dir,
};
const line = (job: string, status = 'ok', owner = 'x') =>
  JSON.stringify({ at: '2026-02-01T01:00:00+01:00', job, status, owner });

writeFileSync(
  join(dir, '2026-02-01.jsonl'),
  [line('zeta/job'), line('alpha/job'), line('mid/job', 'retry'), line('alpha/job')].join('\n') + '\n',
);
writeFileSync(join(dir, '2026-02-02.jsonl'), '');
writeFileSync(join(dir, '2026-02-03.jsonl'), [line('good/job'), 'not json'].join('\n') + '\n');

const app = createApp(config);

describe('GET /digest/:night', () => {
  it('renders a night on disk with the lane banner and rows sorted by job', async () => {
    process.env.LANE_MARKER = 'TEST-MARKER';
    const res = await app.request('/digest/2026-02-01');
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('TEST-MARKER');
    const at = ['alpha/job', 'mid/job', 'zeta/job'].map((j) => html.indexOf(j));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });

  it('404s for a night with no file', async () => {
    expect((await app.request('/digest/2026-02-09')).status).toBe(404);
  });

  it('says nothing ran for an empty night', async () => {
    const res = await app.request('/digest/2026-02-02');
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('nothing ran');
  });

  it('still renders the good rows when a line is bad', async () => {
    const res = await app.request('/digest/2026-02-03');
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('good/job');
  });
});

describe('GET /api/digest/:night', () => {
  it('returns the Night for a night on disk, rows sorted by job', async () => {
    const res = await app.request('/api/digest/2026-02-01');
    expect(res.status).toBe(200);
    const body = (await res.json()) as Night;
    expect(body.night).toBe('2026-02-01');
    expect(body.rows.map((r) => r.job)).toEqual(['alpha/job', 'mid/job', 'zeta/job']);
    expect(body.badLines).toBe(0);
    expect(body.counts).toEqual({ ok: 3, retry: 1, fail: 0 });
  });

  it('404s with an error body for a night with no file', async () => {
    const res = await app.request('/api/digest/2026-02-09');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'no such night', night: '2026-02-09' });
  });

  it('returns no rows for an empty night', async () => {
    const res = await app.request('/api/digest/2026-02-02');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      night: '2026-02-02',
      rows: [],
      badLines: 0,
      counts: { ok: 0, retry: 0, fail: 0 },
    });
  });

  it('counts a bad line and keeps the good rows', async () => {
    const body = (await (await app.request('/api/digest/2026-02-03')).json()) as Night;
    expect(body.badLines).toBe(1);
    expect(body.rows.map((r) => r.job)).toEqual(['good/job']);
  });
});

describe('page and JSON agree', () => {
  it('list the same jobs in the same order', async () => {
    const json = (await (await app.request('/api/digest/2026-02-01')).json()) as Night;
    const html = await (await app.request('/digest/2026-02-01')).text();
    const positions = json.rows.map((r) => html.indexOf(r.job));
    expect(positions.every((i) => i >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});
