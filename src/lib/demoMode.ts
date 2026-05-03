export function isDemoMode(): boolean {
  // Demo mode is DEV-ONLY — never active in production builds
  if (import.meta.env.PROD) return false
  if (typeof window === 'undefined') return false
  const urlFlag = new URLSearchParams(window.location.search).get('demo') === 'true'
  if (urlFlag) localStorage.setItem('drufiy_demo', '1')
  return urlFlag || localStorage.getItem('drufiy_demo') === '1'
}

export function exitDemoMode(): void {
  localStorage.removeItem('drufiy_demo')
  window.location.href = '/'
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 300))
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString()
}

function daysAgo(d: number): string {
  return hoursAgo(d * 24)
}

// ── Static demo data ──────────────────────────────────────────────────────────

const DEMO_USER = {
  id: 'demo-user-1',
  github_username: 'maneesh-demo',
  email: 'demo@drufiy.dev',
}

const DEMO_STATS = {
  repos_connected: 3,
  failures_diagnosed: 47,
  prs_created: 31,
  verified_fixes: 28,
}

const DEMO_REPOS = [
  {
    id: 'repo-1',
    github_repo_id: 1001,
    repo_name: 'drufiy-backend',
    repo_full_name: 'drufiy/drufiy-backend',
    default_branch: 'main',
    is_active: true,
    created_at: daysAgo(28),
  },
  {
    id: 'repo-2',
    github_repo_id: 1002,
    repo_name: 'drufiy-web',
    repo_full_name: 'drufiy/drufiy-web',
    default_branch: 'main',
    is_active: true,
    created_at: daysAgo(21),
  },
  {
    id: 'repo-3',
    github_repo_id: 1003,
    repo_name: 'markora',
    repo_full_name: 'maneesh-demo/markora',
    default_branch: 'main',
    is_active: true,
    created_at: daysAgo(14),
  },
]

const DEMO_GITHUB_REPOS = [
  ...DEMO_REPOS.map((r) => ({
    github_repo_id: r.github_repo_id,
    name: r.repo_name,
    full_name: r.repo_full_name,
    default_branch: r.default_branch,
    private: false,
    updated_at: daysAgo(1),
  })),
  { github_repo_id: 1004, name: 'api-gateway', full_name: 'drufiy/api-gateway', default_branch: 'main', private: true, updated_at: daysAgo(3) },
  { github_repo_id: 1005, name: 'infra', full_name: 'drufiy/infra', default_branch: 'main', private: true, updated_at: daysAgo(5) },
  { github_repo_id: 1006, name: 'cli', full_name: 'drufiy/cli', default_branch: 'main', private: false, updated_at: daysAgo(7) },
  { github_repo_id: 1007, name: 'design-system', full_name: 'maneesh-demo/design-system', default_branch: 'main', private: false, updated_at: daysAgo(10) },
  { github_repo_id: 1008, name: 'blog', full_name: 'maneesh-demo/blog', default_branch: 'main', private: false, updated_at: daysAgo(12) },
]

const REPO_NAMES = ['drufiy/drufiy-backend', 'drufiy/drufiy-web', 'maneesh-demo/markora']
const WORKFLOWS = ['CI', 'Tests', 'Build & Deploy']

const COMMIT_MESSAGES = [
  'fix: update auth middleware',
  'feat: add user export endpoint',
  'refactor: simplify rate limiter',
  'fix: webhook retry logic',
  'chore: bump deps',
  'feat: add CSV download',
  'fix: race condition in queue',
  'refactor: extract validators',
  'feat: dashboard stats endpoint',
  'fix: env var loading order',
  'feat: idempotency keys',
  'fix: timezone in reports',
]

const COMMIT_SHAS = [
  'a3f8c2e1', 'b91d4f7a', 'c04e2b8d', 'd7f3a1c9',
  'e52b9d3f', 'f1a4c6e8', '0d3b7f2a', '1e8c5a4b',
  '2f7d0e3c', '3a1b6d9e', '4c2e8f1b', '5d9a3c7f',
]

const PROBLEM_SUMMARIES = [
  'TypeScript build failed: Property \'retryCount\' does not exist on type \'WebhookEvent\'.',
  'Jest test suite timed out after 5000ms in auth.test.ts.',
  'ESLint error: Unexpected any. Specify a different type in rate-limiter.ts.',
  'Missing environment variable: DATABASE_URL not set in production config.',
  'Build failed: Cannot find module \'./utils/format\' from src/export.ts.',
  'Test failed: Expected status 200 but received 401 in /api/csv endpoint.',
  'TypeError: Cannot read properties of undefined (reading \'id\') in queue worker.',
  'Import cycle detected: validators → models → validators.',
  'Docker build failed: COPY failed — package-lock.json not found.',
  'Flaky test: intermittent timeout in queue.test.ts (3 of last 5 runs failed).',
  'Type error: Argument of type \'string\' not assignable to \'number\' in idempotency key handler.',
  'Build error: Circular dependency detected in webpack timezone bundle.',
]

// 4 verified, 2 fixed, 2 diagnosing, 1 diagnosis_failed, 1 exhausted, 1 pending, 1 iteration_2
const STATUSES = [
  'verified', 'verified', 'verified', 'verified',
  'fixed', 'fixed',
  'diagnosing', 'diagnosing',
  'diagnosis_failed',
  'exhausted',
  'pending',
  'iteration_2',
]

// Spread across last 7 days (hours ago)
const HOURS_AGO = [2, 8, 18, 28, 40, 54, 72, 90, 108, 126, 150, 168]

const DEMO_HISTORY_RUNS = STATUSES.map((status, i) => {
  const hasDiagnosis = !['pending', 'diagnosing'].includes(status)
  const hasPr = ['verified', 'fixed'].includes(status)
  const prNumber = hasPr ? 140 + i : null
  const prUrl = prNumber ? `https://github.com/${REPO_NAMES[i % 3]}/pull/${prNumber}` : null
  const confidence = parseFloat((0.70 + ((i * 0.033) % 0.28)).toFixed(2))

  return {
    id: `run-${i + 1}`,
    repo_id: `repo-${(i % 3) + 1}`,
    status,
    repo_full_name: REPO_NAMES[i % 3],
    branch: 'main',
    commit_sha: COMMIT_SHAS[i],
    commit_message: COMMIT_MESSAGES[i],
    github_workflow_name: WORKFLOWS[i % 3],
    fix_branch_name: prNumber ? `drufiy/fix/${COMMIT_SHAS[i]}` : null,
    created_at: hoursAgo(HOURS_AGO[i]),
    updated_at: hoursAgo(Math.max(HOURS_AGO[i] - 1, 0)),
    diagnosis: hasDiagnosis
      ? {
          problem_summary: PROBLEM_SUMMARIES[i],
          fix_type: i % 2 === 0 ? 'safe_auto_apply' : 'review_recommended',
          confidence,
          github_pr_url: prUrl,
          github_pr_number: prNumber,
          verification_status: status === 'verified' ? 'passed' : null,
        }
      : null,
  }
})

// ── Webhook TypeScript interface content (for run detail) ─────────────────────

const WEBHOOK_IFACE_WITHOUT_RETRY = `// WebhookEvent types for GitHub Actions webhook processing

export enum WebhookEventType {
  WorkflowRun = 'workflow_run',
  CheckRun = 'check_run',
  Push = 'push',
}

export interface WebhookPayload {
  action: string
  sender: { login: string; id: number }
  repository: { id: number; full_name: string; private: boolean }
}

export interface WebhookEvent {
  id: string
  event_type: WebhookEventType
  payload: WebhookPayload
  received_at: string
}

export type WebhookEventHandler = (event: WebhookEvent) => Promise<void>
`

const WEBHOOK_IFACE_WITH_RETRY = `// WebhookEvent types for GitHub Actions webhook processing

export enum WebhookEventType {
  WorkflowRun = 'workflow_run',
  CheckRun = 'check_run',
  Push = 'push',
}

export interface WebhookPayload {
  action: string
  sender: { login: string; id: number }
  repository: { id: number; full_name: string; private: boolean }
}

export interface WebhookEvent {
  id: string
  event_type: WebhookEventType
  payload: WebhookPayload
  received_at: string
  // Retry tracking — added to support webhook retry logic in webhook-handler.ts
  retryCount?: number
  lastAttemptAt?: string
}

export type WebhookEventHandler = (event: WebhookEvent) => Promise<void>
`

function buildRunDetail(id: string) {
  return {
    id,
    status: 'verified',
    github_run_id: 12345678,
    repo_full_name: 'drufiy/drufiy-backend',
    branch: 'main',
    commit_sha: 'a3f8c2e1',
    commit_message: 'feat: add webhook retry logic',
    fix_branch_name: 'drufiy/fix/webhook-retry-types-a3f8c2e1',
    error_message: null,
    created_at: hoursAgo(2),
    updated_at: hoursAgo(1),
    diagnosis: {
      id: 'diag-1',
      iteration: 1,
      problem_summary:
        "TypeScript build failed: Property 'retryCount' does not exist on type 'WebhookEvent'.",
      root_cause:
        "The WebhookEvent interface in src/types/webhook.ts was extended with retry logic in the application code, but the type definition was not updated. The build fails because TypeScript strict mode rejects the implicit any.",
      fix_description:
        'Added optional `retryCount?: number` and `lastAttemptAt?: string` fields to the WebhookEvent interface to match the runtime usage in webhook-handler.ts.',
      fix_type: 'safe_auto_apply',
      confidence: 0.94,
      is_flaky_test: false,
      category: 'type_error',
      logs_truncated_warning: false,
      github_pr_url: 'https://github.com/drufiy/drufiy-backend/pull/142',
      github_pr_number: 142,
      verification_status: 'passed',
      created_at: hoursAgo(2),
      files_changed: [
        {
          path: 'src/types/webhook.ts',
          explanation:
            'Added two optional fields to track retry state on webhook events.',
          new_content: WEBHOOK_IFACE_WITH_RETRY,
          diff_risk: {
            risk_level: 'low',
            risk_reason:
              'Additive change to interface — no existing fields modified.',
            changed_regions: 1,
            lines_added: 2,
            lines_removed: 0,
            has_known_good: true,
          },
        },
      ],
    },
  }
}

function buildDryRunResult(id: string) {
  return {
    run_id: id,
    diff_preview: [
      {
        file_path: 'src/types/webhook.ts',
        current_content: WEBHOOK_IFACE_WITHOUT_RETRY,
        proposed_content: WEBHOOK_IFACE_WITH_RETRY,
        explanation:
          'Added two optional fields to track retry state on webhook events.',
        risk_assessment: {
          risk_level: 'low',
          risk_reason:
            'Additive change to interface — no existing fields modified.',
          changed_regions: 1,
          lines_added: 2,
          lines_removed: 0,
          has_known_good: true,
        },
      },
    ],
    overall_recommendation: 'safe_to_apply',
  }
}

// ── Route dispatcher ──────────────────────────────────────────────────────────

function routeMock(pathname: string, method: string, init?: RequestInit): unknown {
  if (pathname === '/auth/me') return DEMO_USER
  if (pathname === '/auth/github/callback')
    return { token: 'demo-token', user: DEMO_USER }
  if (pathname === '/runs/dashboard/stats') return DEMO_STATS
  if (pathname === '/runs/history') return DEMO_HISTORY_RUNS
  if (pathname === '/repos' || pathname === '/repos/') return DEMO_REPOS
  if (pathname === '/repos/github-list') return DEMO_GITHUB_REPOS
  if (pathname === '/repos/connect' && method === 'POST') {
    const body = init?.body ? (JSON.parse(init.body as string) as Record<string, unknown>) : {}
    return { id: 'new-repo-id', ...body }
  }

  const repoRunsMatch = pathname.match(/^\/repos\/([^/]+)\/runs$/)
  if (repoRunsMatch)
    return [{ id: 'run-verified-1', status: 'verified', created_at: hoursAgo(3) }]

  const runSubMatch = pathname.match(/^\/runs\/([^/]+)\/(dry-run|apply-fix)$/)
  if (runSubMatch && method === 'POST') {
    const [, id, action] = runSubMatch
    if (action === 'dry-run') return buildDryRunResult(id)
    return { pr_url: 'https://github.com/drufiy/drufiy-backend/pull/142', pr_number: 142 }
  }

  const runMatch = pathname.match(/^\/runs\/([^/]+)$/)
  if (runMatch) return buildRunDetail(runMatch[1])

  const repoIdMatch = pathname.match(/^\/repos\/([^/]+)$/)
  if (repoIdMatch && method === 'DELETE') return { success: true }

  console.warn(`[demo] unmatched route: ${method} ${pathname}`)
  return {}
}

export async function mockApi(path: string, init?: RequestInit): Promise<unknown> {
  await randomDelay()
  const [pathname] = path.split('?')
  const method = (init?.method ?? 'GET').toUpperCase()
  return routeMock(pathname, method, init)
}
