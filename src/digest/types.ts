// Plan morning-digest § 1. The contract every part of § 2 starts against: the page, the JSON,
// the board link and the route tests all read a `Night` and nothing else.

export type RunStatus = 'ok' | 'retry' | 'fail';

// One line of runs/<night>.jsonl, once it has parsed.
export type RunLine = {
  at: string;
  job: string;
  status: RunStatus;
  owner: string | null;
  error?: string;
};

// One row per job for the night.
export type DigestRow = {
  job: string;
  // Owner on the job's last line. null is kept; views show it as '—'.
  owner: string | null;
  // Lines for this job, and how many of them were `retry`.
  runs: number;
  retries: number;
  lastStatus: RunStatus;
  // The job's most recent `error`, or null if no line had one.
  lastError: string | null;
  // `at` of the first and last line, exactly as logged (offset kept, never UTC).
  firstAt: string;
  lastAt: string;
};

export type Night = {
  night: string;
  // Sorted by job, so the page and the JSON can't disagree on order.
  rows: DigestRow[];
  // Lines that didn't parse: counted, never thrown.
  badLines: number;
  // Parsed lines per status, for the board link.
  counts: Record<RunStatus, number>;
};

// null when runs/<night>.jsonl doesn't exist, or `night` isn't YYYY-MM-DD (the route's 404).
// An empty file is a night with no rows ("nothing ran").
export type ReadNight = (runsDir: string, night: string) => Night | null;
