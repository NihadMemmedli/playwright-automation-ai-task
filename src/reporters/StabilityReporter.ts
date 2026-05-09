import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

interface TestStats {
  id: string;
  title: string;
  file: string;
  project: string;
  runs: number;
  passed: number;
  failed: number;
  timedOut: number;
  skipped: number;
  durations: number[];
  failures: string[];
}

interface StabilityReport {
  generatedAt: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  totalTests: number;
  totalRuns: number;
  totalPassed: number;
  totalFailed: number;
  overallFlakeRate: number;
  threshold: number;
  exitCode: number;
  tests: Array<TestStats & { flakeRate: number; p50: number; p95: number }>;
}

const OUTPUT_DIR = resolve(process.cwd(), 'reports/stability');
const JSON_PATH = resolve(OUTPUT_DIR, 'stability-report.json');
const MD_PATH = resolve(OUTPUT_DIR, 'stability-report.md');

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function quantile(sortedNums: number[], q: number): number {
  if (sortedNums.length === 0) return 0;
  const idx = Math.min(sortedNums.length - 1, Math.floor(q * sortedNums.length));
  return sortedNums[idx];
}

export default class StabilityReporter implements Reporter {
  private stats = new Map<string, TestStats>();
  private startedAt = new Date();

  onBegin(_config: FullConfig, _suite: Suite): void {
    this.startedAt = new Date();
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const file = test.location?.file ?? '';
    const project = test.parent?.project()?.name ?? '';
    // Key by titlePath (stable across --repeat-each); test.id changes per repeat.
    const titlePath = test.titlePath().join(' › ');
    const key = `${project}::${titlePath}`;

    const existing = this.stats.get(key) ?? {
      id: titlePath,
      title: test.titlePath().slice(2).join(' › ') || test.title,
      file: file.replace(`${process.cwd()}/`, ''),
      project,
      runs: 0,
      passed: 0,
      failed: 0,
      timedOut: 0,
      skipped: 0,
      durations: [],
      failures: [],
    };

    existing.runs += 1;
    existing.durations.push(result.duration);

    switch (result.status) {
      case 'passed':
        existing.passed += 1;
        break;
      case 'failed':
        existing.failed += 1;
        if (result.error?.message) {
          const cleaned = stripAnsi(result.error.message).split('\n')[0].slice(0, 200);
          existing.failures.push(cleaned);
        }
        break;
      case 'timedOut':
        existing.timedOut += 1;
        existing.failed += 1;
        existing.failures.push('Timed out');
        break;
      case 'skipped':
      case 'interrupted':
        existing.skipped += 1;
        break;
    }

    this.stats.set(key, existing);
  }

  async onEnd(_result: FullResult): Promise<void> {
    const finishedAt = new Date();
    const threshold = Number(process.env.STABILITY_THRESHOLD ?? '0');

    const enriched = Array.from(this.stats.values())
      .map((t) => {
        const observed = t.passed + t.failed;
        const flakeRate = observed === 0 ? 0 : t.failed / observed;
        const sortedDurations = [...t.durations].sort((a, b) => a - b);
        return {
          ...t,
          flakeRate,
          p50: quantile(sortedDurations, 0.5),
          p95: quantile(sortedDurations, 0.95),
        };
      })
      .sort((a, b) => b.flakeRate - a.flakeRate || a.title.localeCompare(b.title));

    const totalRuns = enriched.reduce((s, t) => s + t.runs, 0);
    const totalPassed = enriched.reduce((s, t) => s + t.passed, 0);
    const totalFailed = enriched.reduce((s, t) => s + t.failed, 0);
    const overallFlakeRate = totalPassed + totalFailed === 0 ? 0 : totalFailed / (totalPassed + totalFailed);
    const maxFlakeRate = enriched.reduce((m, t) => Math.max(m, t.flakeRate), 0);
    const exitCode = maxFlakeRate > threshold ? 1 : 0;

    const report: StabilityReport = {
      generatedAt: finishedAt.toISOString(),
      startedAt: this.startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - this.startedAt.getTime(),
      totalTests: enriched.length,
      totalRuns,
      totalPassed,
      totalFailed,
      overallFlakeRate,
      threshold,
      exitCode,
      tests: enriched,
    };

    mkdirSync(dirname(JSON_PATH), { recursive: true });
    writeFileSync(JSON_PATH, JSON.stringify(report, null, 2));
    writeFileSync(MD_PATH, renderMarkdown(report));

    // eslint-disable-next-line no-console
    console.log(`\n📊 Stability report → ${MD_PATH}`);
    // eslint-disable-next-line no-console
    console.log(`   Overall flake rate: ${pct(overallFlakeRate)} (threshold ${pct(threshold)})`);

    if (exitCode !== 0) {
      // eslint-disable-next-line no-console
      console.log(`   ❌ FAIL: ${enriched.filter((t) => t.flakeRate > threshold).length} test(s) above threshold`);
      process.exitCode = 1;
    }
  }
}

function renderMarkdown(r: StabilityReport): string {
  const flaky = r.tests.filter((t) => t.flakeRate > 0);
  const stable = r.tests.filter((t) => t.flakeRate === 0);

  const lines: string[] = [];
  lines.push('# Stability Report');
  lines.push('');
  lines.push(`_Generated: ${r.generatedAt}_`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|---|---|');
  lines.push(`| Tests observed | ${r.totalTests} |`);
  lines.push(`| Total runs | ${r.totalRuns} |`);
  lines.push(`| Passed | ${r.totalPassed} |`);
  lines.push(`| Failed | ${r.totalFailed} |`);
  lines.push(`| Overall flake rate | **${pct(r.overallFlakeRate)}** |`);
  lines.push(`| Threshold | ${pct(r.threshold)} |`);
  lines.push(`| Verdict | ${r.exitCode === 0 ? '✅ Stable' : '❌ Flaky tests detected'} |`);
  lines.push(`| Duration | ${(r.durationMs / 1000).toFixed(1)}s |`);
  lines.push('');

  if (flaky.length > 0) {
    lines.push(`## Flaky tests (${flaky.length})`);
    lines.push('');
    lines.push('| Test | File | Project | Runs | Passed | Failed | Flake rate | p50 (ms) | p95 (ms) |');
    lines.push('|---|---|---|---|---|---|---|---|---|');
    for (const t of flaky) {
      lines.push(
        `| ${escape(t.title)} | \`${t.file}\` | ${t.project} | ${t.runs} | ${t.passed} | ${t.failed} | **${pct(t.flakeRate)}** | ${t.p50.toFixed(0)} | ${t.p95.toFixed(0)} |`,
      );
    }
    lines.push('');
    lines.push('### Failure samples');
    lines.push('');
    for (const t of flaky) {
      if (t.failures.length === 0) continue;
      lines.push(`**${escape(t.title)}** (\`${t.file}\`)`);
      lines.push('');
      const unique = Array.from(new Set(t.failures)).slice(0, 5);
      for (const f of unique) lines.push(`- ${escape(f)}`);
      lines.push('');
    }
  } else {
    lines.push('## Flaky tests');
    lines.push('');
    lines.push('_None detected. ✅_');
    lines.push('');
  }

  lines.push(`<details><summary>Stable tests (${stable.length})</summary>`);
  lines.push('');
  lines.push('| Test | File | Project | Runs | p50 (ms) | p95 (ms) |');
  lines.push('|---|---|---|---|---|---|');
  for (const t of stable) {
    lines.push(
      `| ${escape(t.title)} | \`${t.file}\` | ${t.project} | ${t.runs} | ${t.p50.toFixed(0)} | ${t.p95.toFixed(0)} |`,
    );
  }
  lines.push('');
  lines.push('</details>');
  lines.push('');

  return lines.join('\n');
}

function escape(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1B\[[0-9;]*[A-Za-z]/g;
function stripAnsi(s: string): string {
  return s.replace(ANSI_RE, '');
}
