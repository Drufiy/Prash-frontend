import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  ExternalLink,
  ChevronLeft,
  AlertTriangle,
  Lightbulb,
  Wrench,
  FileCode,
  CheckCircle2,
  Loader2,
  XCircle,
  Info,
  RefreshCw,
  Lock,
  SkipForward,
  Zap,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { statusBadge, POLLING_STATUSES } from '@/lib/statusBadge'
import { posthog } from '@/lib/posthog'

// ── Types ─────────────────────────────────────────────────────────────────────

interface FileChange {
  path: string
  new_content: string
  explanation: string
  diff_risk?: {
    risk_level: 'low' | 'medium' | 'high'
    risk_reason: string
    changed_regions: number
    lines_added: number
    lines_removed: number
    has_known_good: boolean
  }
}

interface RequiredSecret {
  name: string
  description: string
}

interface Diagnosis {
  id: string
  iteration: number
  problem_summary: string
  root_cause: string
  fix_description: string
  fix_type: 'safe_auto_apply' | 'review_recommended' | 'manual_required'
  confidence: number
  is_flaky_test: boolean
  category: string
  logs_truncated_warning: boolean
  // Backend returns list[str] — frontend normalizes to objects for display
  required_secrets: (RequiredSecret | string)[]
  files_changed: FileChange[]
  github_pr_url: string | null
  github_pr_number: number | null
  verification_status: string | null
  created_at: string
}

/** Normalize backend string[] or object[] to { name, description } for display */
function normalizeSecret(s: RequiredSecret | string): RequiredSecret {
  if (typeof s === 'string') return { name: s, description: '' }
  return s
}

interface RunDetail {
  id: string
  status: string
  github_run_id: number
  repo_full_name: string
  branch: string
  commit_sha: string
  commit_message: string
  fix_branch_name: string | null
  error_message: string | null
  logs_url: string | null
  created_at: string
  updated_at: string
  diagnosis: Diagnosis | null
}

interface LogsResponse {
  logs: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface DiffPreviewFile {
  file_path: string
  current_content: string
  proposed_content: string
  explanation: string
  risk_assessment: {
    risk_level: 'low' | 'medium' | 'high'
    risk_reason: string
    changed_regions: number
    lines_added: number
    lines_removed: number
    has_known_good: boolean
  }
}

interface DryRunResult {
  run_id: string
  diff_preview: DiffPreviewFile[]
  overall_recommendation: 'safe_to_apply' | 'review_before_applying'
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function langFromPath(path: string): string {
  const ext = path.split('.').pop() ?? ''
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
    py: 'python', yml: 'yaml', yaml: 'yaml', json: 'json',
    sh: 'bash', bash: 'bash', go: 'go', rs: 'rust', toml: 'toml',
  }
  return map[ext] ?? 'text'
}

function riskColor(level: string) {
  if (level === 'high') return 'border-red-800 text-red-400'
  if (level === 'medium') return 'border-amber-700 text-amber-400'
  return 'border-emerald-800 text-emerald-400'
}

// ── Status stepper ────────────────────────────────────────────────────────────

const STEPS = ['Detected', 'Diagnosing', 'Fix Ready', 'Applying', 'Verified']

function stepIndex(status: string): number {
  if (['pending'].includes(status)) return 0
  if (['diagnosing', 'iteration_2'].includes(status)) return 1
  if (['diagnosed'].includes(status)) return 2
  if (['applying'].includes(status)) return 3
  if (['fixed', 'waiting_verification', 'verified'].includes(status)) return 4
  return 0
}

function Stepper({ status }: { status: string }) {
  const current = stepIndex(status)
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border
                  ${done ? 'bg-emerald-600 border-emerald-600 text-white' : ''}
                  ${active ? 'bg-violet-600 border-violet-600 text-white' : ''}
                  ${!done && !active ? 'border-zinc-700 text-zinc-500' : ''}
                `}
              >
                {done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
              </div>
              <span className={`text-xs whitespace-nowrap ${active ? 'text-zinc-200' : 'text-zinc-500'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-16 mb-4 mx-1 ${i < current ? 'bg-emerald-700' : 'bg-zinc-800'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Dry-run dialog ────────────────────────────────────────────────────────────

function DryRunDialog({
  result,
  onClose,
  onApply,
  applying,
}: {
  result: DryRunResult
  onClose: () => void
  onApply: () => void
  applying: boolean
}) {
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Dry Run Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-1 mb-4">
          <Badge
            variant="outline"
            className={result.overall_recommendation === 'safe_to_apply'
              ? 'border-emerald-800 text-emerald-400'
              : 'border-amber-700 text-amber-400'}
          >
            {result.overall_recommendation === 'safe_to_apply' ? 'Safe to apply' : 'Review before applying'}
          </Badge>
        </div>

        {result.diff_preview.map((file) => (
          <div key={file.file_path} className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="text-sm text-zinc-300 font-mono">{file.file_path}</code>
              <Badge variant="outline" className={`text-xs ${riskColor(file.risk_assessment.risk_level)}`}>
                {file.risk_assessment.risk_level} risk
              </Badge>
            </div>
            <p className="text-zinc-500 text-xs">{file.explanation}</p>
            <Tabs defaultValue="proposed">
              <TabsList className="bg-zinc-800">
                <TabsTrigger value="current" className="text-xs">Current</TabsTrigger>
                <TabsTrigger value="proposed" className="text-xs">Proposed</TabsTrigger>
              </TabsList>
              <TabsContent value="current">
                <SyntaxHighlighter
                  language={langFromPath(file.file_path)}
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: '12px' }}
                >
                  {file.current_content || '(new file)'}
                </SyntaxHighlighter>
              </TabsContent>
              <TabsContent value="proposed">
                <SyntaxHighlighter
                  language={langFromPath(file.file_path)}
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: '12px' }}
                >
                  {file.proposed_content}
                </SyntaxHighlighter>
              </TabsContent>
            </Tabs>
          </div>
        ))}

        <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-zinc-900 pb-1">
          <Button variant="outline" className="border-zinc-700" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-violet-600 hover:bg-violet-500 text-white"
            disabled={applying}
            onClick={onApply}
          >
            {applying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Apply This Fix
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Manual action card ────────────────────────────────────────────────────────

interface ManualActionCardProps {
  runId: string
  diagnosis: Diagnosis
  repoFullName: string
  onActionComplete: () => void
}

function ManualActionCard({ runId, diagnosis, repoFullName, onActionComplete }: ManualActionCardProps) {
  const [secretName, setSecretName] = useState('')
  const [secretValue, setSecretValue] = useState('')
  const [showSecretForm, setShowSecretForm] = useState(false)
  const [skipDialogOpen, setSkipDialogOpen] = useState(false)
  const [skipTestName, setSkipTestName] = useState('')
  const [skipTestFile, setSkipTestFile] = useState('')

  const category = diagnosis.category
  const rawSecrets = diagnosis.required_secrets ?? []
  const hasRequiredSecrets = rawSecrets.length > 0
  const [selectedSecretIndex, setSelectedSecretIndex] = useState(0)

  // Auto-show secret form if required_secrets are provided
  useEffect(() => {
    if (hasRequiredSecrets) {
      setShowSecretForm(true)
      setSecretName(normalizeSecret(rawSecrets[0]).name)
    }
  }, [hasRequiredSecrets]) // eslint-disable-line react-hooks/exhaustive-deps

  // Extract test name from problem_summary heuristically
  const inferredTestName = (() => {
    const m = diagnosis.problem_summary.match(/test_\w+|it\(['"](.+?)['"]\)|describe\(['"](.+?)['"]\)/)
    return m ? (m[1] || m[2] || m[0]) : ''
  })()

  const forceFix = useMutation({
    mutationFn: () => api(`/runs/${runId}/force-fix`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Force-fix queued — Prash will retry with a stronger prompt')
      onActionComplete()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const addSecret = useMutation({
    mutationFn: () => api(`/runs/${runId}/add-secret`, {
      method: 'POST',
      body: JSON.stringify({ name: secretName, value: secretValue }),
    }),
    onSuccess: (data: unknown) => {
      const r = data as { secret_name: string; workflow_rerun: boolean }
      toast.success(`Secret "${r.secret_name}" added${r.workflow_rerun ? ' — workflow re-triggered' : ''}`)
      setShowSecretForm(false)
      setSecretName('')
      setSecretValue('')
      onActionComplete()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const skipTest = useMutation({
    mutationFn: () => api(`/runs/${runId}/skip-test`, {
      method: 'POST',
      body: JSON.stringify({ test_name: skipTestName, test_file: skipTestFile || undefined }),
    }),
    onSuccess: (data: unknown) => {
      const r = data as { pr_url: string; pr_number: number }
      toast.success(`PR #${r.pr_number} created — test skipped`, {
        action: { label: 'View PR', onClick: () => window.open(r.pr_url, '_blank') },
      })
      setSkipDialogOpen(false)
      onActionComplete()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const rediagnose = useMutation({
    mutationFn: () => api(`/runs/${runId}/rediagnose`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Re-diagnosing with a fresh model attempt…')
      onActionComplete()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="bg-zinc-900 border border-orange-900/50 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-orange-400" />
        <span className="text-sm font-medium text-zinc-300">Available Actions</span>
        <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500 ml-auto">
          {category}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Force-fix: for any code/workflow/dependency issue */}
        {(category === 'code' || category === 'workflow_config' || category === 'dependency') && (
          <Button
            size="sm"
            variant="outline"
            className="border-violet-700 text-violet-300 hover:bg-violet-900/30"
            disabled={forceFix.isPending}
            onClick={() => forceFix.mutate()}
          >
            {forceFix.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Zap className="h-3.5 w-3.5 mr-1.5" />}
            Try Fix Anyway
          </Button>
        )}

        {/* Skip test: for code/flaky_test with a test name */}
        {(category === 'code' || category === 'flaky_test') && (
          <Button
            size="sm"
            variant="outline"
            className="border-amber-700 text-amber-300 hover:bg-amber-900/30"
            onClick={() => {
              setSkipTestName(inferredTestName)
              setSkipDialogOpen(true)
            }}
          >
            <SkipForward className="h-3.5 w-3.5 mr-1.5" />
            Skip This Test
          </Button>
        )}

        {/* Add secret: for environment issues OR when required_secrets provided */}
        {(category === 'environment' || hasRequiredSecrets) && (
          <Button
            size="sm"
            variant="outline"
            className="border-amber-700 text-amber-300 hover:bg-amber-900/30"
            onClick={() => setShowSecretForm(!showSecretForm)}
          >
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            {hasRequiredSecrets ? `Add Secret (${rawSecrets.length})` : 'Add Secret'}
          </Button>
        )}

        {/* Open in GitHub: for unknown/database */}
        {(category === 'unknown' || category === 'database_migration') && (
          <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300" asChild>
            <a href={`https://github.com/${repoFullName}`} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Open in GitHub
            </a>
          </Button>
        )}

        {/* Re-diagnose: always available as last resort */}
        <Button
          size="sm"
          variant="outline"
          className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
          disabled={rediagnose.isPending}
          onClick={() => {
            posthog.capture('rediagnose_clicked', { run_id: runId, category, fix_type: diagnosis.fix_type })
            rediagnose.mutate()
          }}
        >
          {rediagnose.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
          Re-diagnose
        </Button>
      </div>

      {/* Add Secret inline form */}
      {showSecretForm && (
        <div className="border border-zinc-700 rounded-lg p-4 space-y-3 bg-zinc-950/50">
          {hasRequiredSecrets ? (
            // Required secrets provided — show structured form
            <div className="space-y-3">
              <p className="text-zinc-400 text-xs">
                Add the required secrets to your GitHub repo. The workflow will re-trigger automatically.
              </p>

              {/* Secret selector if multiple */}
              {rawSecrets.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {rawSecrets.map((secret, idx) => {
                    const s = normalizeSecret(secret)
                    return (
                      <Button
                        key={s.name}
                        size="sm"
                        variant={selectedSecretIndex === idx ? 'default' : 'outline'}
                        className={selectedSecretIndex === idx
                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                          : 'border-zinc-700 text-zinc-400'
                        }
                        onClick={() => {
                          setSelectedSecretIndex(idx)
                          setSecretName(s.name)
                          setSecretValue('')
                        }}
                      >
                        {s.name}
                      </Button>
                    )
                  })}
                </div>
              )}

              {/* Current secret description */}
              {(() => {
                const s = normalizeSecret(rawSecrets[selectedSecretIndex])
                return (
                  <div className="bg-zinc-900/50 rounded p-3">
                    <p className="text-zinc-300 text-sm font-mono">{s.name}</p>
                    {s.description && <p className="text-zinc-500 text-xs mt-1">{s.description}</p>}
                  </div>
                )
              })()}

              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder={`Enter value for ${normalizeSecret(rawSecrets[selectedSecretIndex]).name}`}
                  value={secretValue}
                  onChange={(e) => setSecretValue(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100 text-sm h-9 flex-1"
                  autoFocus
                />
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-500 text-white shrink-0 h-9"
                  disabled={!secretValue || addSecret.isPending}
                  onClick={() => addSecret.mutate()}
                >
                  {addSecret.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Add Secret'}
                </Button>
              </div>

              {/* Progress indicator */}
              {rawSecrets.length > 1 && (
                <p className="text-zinc-500 text-xs">
                  Secret {selectedSecretIndex + 1} of {rawSecrets.length}
                </p>
              )}
            </div>
          ) : (
            // No required secrets — show generic form
            <>
              <p className="text-zinc-400 text-xs">
                This will add the secret to your GitHub repo's Actions secrets and re-trigger the failed workflow.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="SECRET_NAME"
                  value={secretName}
                  onChange={(e) => setSecretName(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100 font-mono text-sm h-8"
                />
                <Input
                  type="password"
                  placeholder="secret value"
                  value={secretValue}
                  onChange={(e) => setSecretValue(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100 text-sm h-8"
                />
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-500 text-white shrink-0"
                  disabled={!secretName || !secretValue || addSecret.isPending}
                  onClick={() => addSecret.mutate()}
                >
                  {addSecret.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Add'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Skip Test dialog */}
      <Dialog open={skipDialogOpen} onOpenChange={setSkipDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Skip Test</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Add @pytest.mark.skip or test.skip to the failing test.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Test name (function name)</label>
              <Input
                placeholder="test_my_function"
                value={skipTestName}
                onChange={(e) => setSkipTestName(e.target.value)}
                className="bg-zinc-950 border-zinc-700 text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">Test file path (optional — auto-detected if blank)</label>
              <Input
                placeholder="tests/test_foo.py"
                value={skipTestFile}
                onChange={(e) => setSkipTestFile(e.target.value)}
                className="bg-zinc-950 border-zinc-700 text-zinc-100 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" className="border-zinc-700" onClick={() => setSkipDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-500 text-white"
                disabled={!skipTestName || skipTest.isPending}
                onClick={() => skipTest.mutate()}
              >
                {skipTest.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Skip PR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Chat fallback response generator ─────────────────────────────────────────

function generateFallbackResponse(message: string, diagnosis: Diagnosis | null | undefined): string {
  const lowerMsg = message.toLowerCase()

  if (!diagnosis) {
    return "I'm still analyzing this CI run. Please wait a moment for the diagnosis to complete."
  }

  if (lowerMsg.includes('what went wrong') || lowerMsg.includes('problem')) {
    return `**Problem:** ${diagnosis.problem_summary}\n\n**Category:** ${diagnosis.category}`
  }

  if (lowerMsg.includes('root cause') || lowerMsg.includes('why')) {
    return `**Root Cause:** ${diagnosis.root_cause}`
  }

  if (lowerMsg.includes('fix') || lowerMsg.includes('solution')) {
    if (diagnosis.fix_type === 'manual_required') {
      return `**Manual Action Required:** ${diagnosis.fix_description}\n\nThis issue requires manual intervention and cannot be auto-fixed safely.`
    }
    return `**Proposed Fix:** ${diagnosis.fix_description}\n\n**Confidence:** ${Math.round(diagnosis.confidence * 100)}%`
  }

  if (lowerMsg.includes('retry') || lowerMsg.includes('again')) {
    return "You can request a re-diagnosis using the 'Re-diagnose' button. This will trigger a fresh analysis of the CI failure."
  }

  if (lowerMsg.includes('confidence')) {
    return `I'm ${Math.round(diagnosis.confidence * 100)}% confident in this diagnosis. ${
      diagnosis.confidence >= 0.9
        ? 'This is a high-confidence auto-fix.'
        : diagnosis.confidence >= 0.7
        ? 'This fix should be reviewed before applying.'
        : 'This fix has lower confidence — manual review recommended.'
    }`
  }

  return `Based on the diagnosis:\n\n**Problem:** ${diagnosis.problem_summary}\n\n**Fix:** ${diagnosis.fix_type === 'manual_required' ? diagnosis.fix_description : diagnosis.fix_description}`
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RunDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null)
  const trackedView = useRef(false)
  const trackedManual = useRef(false)

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isAiResponding, setIsAiResponding] = useState(false)

  // Progressive reveal state for AI sections
  const [revealedSections, setRevealedSections] = useState({
    problem: false,
    rootCause: false,
    fix: false,
  })

  const { data: run, isLoading, isError } = useQuery<RunDetail>({
    queryKey: ['run', id],
    queryFn: () => api(`/runs/${id}`),
    refetchInterval: (query) =>
      POLLING_STATUSES.has(query.state.data?.status ?? '') ? 4000 : false,
  })

  // Fetch CI logs via backend proxy
  const { data: logsData, isLoading: logsLoading, error: logsError } = useQuery<LogsResponse>({
    queryKey: ['run-logs', id],
    queryFn: () => api(`/runs/${id}/logs`),
    enabled: !!run?.logs_url,
    staleTime: 5 * 60 * 1000, // Logs don't change, cache for 5 minutes
  })

  // run_detail_viewed — fires once when run data loads
  useEffect(() => {
    if (run && !trackedView.current) {
      trackedView.current = true
      posthog.capture('run_detail_viewed', {
        run_id: run.id,
        status: run.status,
        repo: run.repo_full_name,
        fix_type: run.diagnosis?.fix_type ?? null,
      })
    }
  }, [run])

  // manual_fix_required_seen — fires once when user sees a manual_required diagnosis
  useEffect(() => {
    if (run?.diagnosis?.fix_type === 'manual_required' && !trackedManual.current) {
      trackedManual.current = true
      posthog.capture('manual_fix_required_seen', {
        run_id: run.id,
        repo: run.repo_full_name,
        category: run.diagnosis.category,
        problem_summary: run.diagnosis.problem_summary,
      })
    }
  }, [run])

  // Progressive reveal: animate diagnosis sections appearing
  useEffect(() => {
    if (run?.diagnosis) {
      // Reset reveal state when diagnosis changes
      setRevealedSections({ problem: false, rootCause: false, fix: false })

      // Staggered reveal with smooth timing
      const timers: ReturnType<typeof setTimeout>[] = []
      timers.push(setTimeout(() => setRevealedSections((s) => ({ ...s, problem: true })), 100))
      timers.push(setTimeout(() => setRevealedSections((s) => ({ ...s, rootCause: true })), 400))
      timers.push(setTimeout(() => setRevealedSections((s) => ({ ...s, fix: true })), 700))

      return () => timers.forEach(clearTimeout)
    }
  }, [run?.diagnosis?.id])

  const dryRunMutation = useMutation({
    mutationFn: () => api<DryRunResult>(`/runs/${id}/dry-run`, { method: 'POST' }),
    onSuccess: (data) => setDryRunResult(data),
    onError: (e: Error) => toast.error(e.message),
  })

  const applyMutation = useMutation({
    mutationFn: () => api(`/runs/${id}/apply-fix`, { method: 'POST' }),
    onSuccess: (data: unknown) => {
      const result = data as { pr_url: string; pr_number: number }
      posthog.capture('fix_applied', {
        run_id: id,
        pr_number: result.pr_number,
        repo: run?.repo_full_name,
        fix_type: run?.diagnosis?.fix_type,
      })
      toast.success(`PR #${result.pr_number} created!`, {
        action: { label: 'View PR', onClick: () => window.open(result.pr_url, '_blank') },
      })
      setDryRunResult(null)
      qc.invalidateQueries({ queryKey: ['run', id] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // Chat mutation - sends message to backend; falls back to local diagnosis context on 404/error
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await api<{ response: string }>(`/runs/${id}/chat`, {
        method: 'POST',
        body: JSON.stringify({
          message,
          context: {
            run_id: id,
            diagnosis_id: run?.diagnosis?.id,
            current_status: run?.status,
            problem_summary: run?.diagnosis?.problem_summary,
            root_cause: run?.diagnosis?.root_cause,
          },
        }),
      })
      return response
    },
    onMutate: () => {
      setIsAiResponding(true)
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: data.response, created_at: new Date().toISOString() },
      ])
      setIsAiResponding(false)
    },
    onError: () => {
      // Fallback: Generate contextual response based on diagnosis
      const fallbackResponse = generateFallbackResponse(chatInput, run?.diagnosis)
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: fallbackResponse, created_at: new Date().toISOString() },
      ])
      setIsAiResponding(false)
    },
  })

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (isError || !run) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Alert className="border-red-900 bg-red-950/20">
          <AlertDescription className="text-red-400">Failed to load run details.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const d = run.diagnosis
  const { label, className } = statusBadge(run.status, d?.fix_type)
  const canApply = d && !['manual_required'].includes(d.fix_type) && !d.is_flaky_test
  // 'diagnosed' is terminal when the model has decided it can't auto-fix (manual_required or flaky)
  const isDiagnosedTerminal = run.status === 'diagnosed' && d && (d.fix_type === 'manual_required' || d.is_flaky_test)
  const isTerminal = ['verified', 'diagnosis_failed', 'exhausted', 'skipped'].includes(run.status) || !!isDiagnosedTerminal
  const isApplied = ['fixed', 'waiting_verification', 'verified'].includes(run.status)

  // Helper to highlight error lines in logs
  const highlightLogLine = (line: string): boolean => {
    const lower = line.toLowerCase()
    return lower.includes('error') || lower.includes('failed') || lower.includes('exception') || lower.includes('fatal')
  }

  return (
    <div className="p-8 pb-32">
      {/* Back + header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`${className} text-sm px-3 py-1`}>{label}</Badge>
              {d?.iteration && d.iteration > 1 && (
                <Badge variant="outline" className="border-orange-700 text-orange-400">
                  Iteration {d.iteration}
                </Badge>
              )}
            </div>
            <p className="text-zinc-400 text-sm font-mono">{run.repo_full_name}</p>
            <p className="text-zinc-500 text-xs font-mono">
              {run.commit_sha.slice(0, 8)} · {run.commit_message?.split('\n')[0]}
            </p>
          </div>
          <span className="text-zinc-600 text-xs whitespace-nowrap flex-shrink-0">
            {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
          </span>
        </div>

        <Stepper status={run.status} />

        {/* Split Layout: Logs Left, AI Panel Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* LEFT: CI Logs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-zinc-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">CI Logs</span>
              {!run.logs_url && (
                <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">Not Available</Badge>
              )}
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              {logsLoading && (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              )}

              {logsError && (
                <div className="p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-amber-500/50 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">Failed to load logs</p>
                  <p className="text-zinc-600 text-xs mt-1">
                    {(logsError as Error)?.message || 'Logs may have expired or are unavailable'}
                  </p>
                </div>
              )}

              {!run.logs_url && !logsLoading && (
                <div className="p-6 text-center">
                  <Info className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">Logs not available</p>
                  <p className="text-zinc-600 text-xs mt-1">This run may predate log collection</p>
                </div>
              )}

              {logsData?.logs && (
                <div className="max-h-[600px] overflow-y-auto bg-zinc-950">
                  <div className="font-mono text-xs p-4">
                    {logsData.logs.split('\n').map((line, i) => {
                      const isError = highlightLogLine(line)
                      return (
                        <div
                          key={i}
                          className={`flex gap-3 leading-relaxed ${
                            isError
                              ? 'bg-red-950/20 -mx-4 px-4 border-l-2 border-red-500/50'
                              : 'hover:bg-zinc-900/50 -mx-4 px-4'
                          }`}
                        >
                          <span className="text-zinc-700 select-none w-10 shrink-0 text-right tabular-nums">
                            {i + 1}
                          </span>
                          <span className={isError ? 'text-red-300' : 'text-zinc-400'}>
                            {line || '\u00A0'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: AI Analysis Panel */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">AI Analysis</span>
              {d && <span className="text-xs text-zinc-600">· Iteration {d.iteration}</span>}
            </div>

      {/* Error banner */}
      {(run.status === 'diagnosis_failed' || run.status === 'exhausted') && (
        <Alert className="mb-6 border-red-900 bg-red-950/20">
          <XCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">
            {run.error_message ?? 'Auto-fix failed after 2 attempts. Manual review required.'}
          </AlertDescription>
        </Alert>
      )}

      {run.status === 'iteration_2' && (
        <Alert className="mb-6 border-amber-800 bg-amber-950/20">
          <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
          <AlertDescription className="text-amber-400">
            Initial fix didn't pass CI. Prash is running a second analysis…
          </AlertDescription>
        </Alert>
      )}

      {/* Diagnosed + manual_required — clear terminal state banner */}
      {run.status === 'diagnosed' && d?.fix_type === 'manual_required' && (
        <Alert className="mb-6 border-orange-800 bg-orange-950/20">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <AlertDescription className="text-orange-300">
            Prash diagnosed the issue but can't safely auto-fix it. Review the diagnosis below and apply the fix manually.
          </AlertDescription>
        </Alert>
      )}

      {/* Diagnosed + review_recommended — show fix with action buttons */}
      {run.status === 'diagnosed' && d?.fix_type === 'review_recommended' && (
        <Alert className="mb-6 border-violet-800 bg-violet-950/20">
          <Info className="h-4 w-4 text-violet-400" />
          <AlertDescription className="text-violet-300">
            Prash has a proposed fix ready for your review. Check the diff below before applying.
          </AlertDescription>
        </Alert>
      )}

      {d ? (
        <div className="space-y-4">
          {/* AI analysis header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">AI Analysis</span>
            <span className="text-xs text-zinc-600">·</span>
            <span className="text-xs text-zinc-600">Iteration {d.iteration}</span>
          </div>

          {/* Warnings */}
          {d.logs_truncated_warning && (
            <Alert className="border-zinc-700 bg-zinc-900/50">
              <Info className="h-4 w-4 text-zinc-400" />
              <AlertDescription className="text-zinc-400 text-sm">
                Logs were truncated — confidence may be reduced.
              </AlertDescription>
            </Alert>
          )}

          {d.is_flaky_test && (
            <Alert className="border-amber-800 bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-amber-400">
                Flaky test detected — auto-fix disabled. {d.fix_description}
              </AlertDescription>
            </Alert>
          )}

          {/* Problem */}
          <div
            className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 transition-all duration-300 ${
              revealedSections.problem ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-zinc-300">Problem</span>
            </div>
            <p className="text-zinc-100 text-sm leading-relaxed">{d.problem_summary}</p>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400 font-mono">
                {d.category}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${
                  d.confidence >= 0.9
                    ? 'border-emerald-700 text-emerald-400 bg-emerald-950/30'
                    : d.confidence >= 0.7
                    ? 'border-amber-700 text-amber-400 bg-amber-950/30'
                    : 'border-zinc-700 text-zinc-400'
                }`}
              >
                • {Math.round(d.confidence * 100)}% confidence
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${
                  d.fix_type === 'safe_auto_apply'
                    ? 'border-emerald-800 text-emerald-400'
                    : d.fix_type === 'review_recommended'
                    ? 'border-amber-700 text-amber-400'
                    : 'border-red-800 text-red-400'
                }`}
              >
                {d.fix_type.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>

          {/* Root Cause */}
          <div
            className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 transition-all duration-300 ${
              revealedSections.rootCause ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-zinc-300">Root Cause</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">{d.root_cause}</p>
          </div>

          {/* Proposed Fix */}
          {d.fix_type !== 'manual_required' && (
            <div
              className={`bg-gradient-to-br from-violet-950/30 to-zinc-900 border border-violet-800/40 border-l-[3px] border-l-violet-500 rounded-xl p-5 transition-all duration-300 ${
                revealedSections.fix ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}>
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium text-zinc-300">Proposed Fix</span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">{d.fix_description}</p>
            </div>
          )}

          {d.fix_type === 'manual_required' && (
            <>
              <div
                className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 border-l-2 border-l-zinc-600 transition-all duration-300 ${
                  revealedSections.fix ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-300">Manual Action Required</span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">{d.fix_description}</p>
              </div>
              {/* Action card — always shown for manual_required */}
              <ManualActionCard
                runId={run.id}
                diagnosis={d}
                repoFullName={run.repo_full_name}
                onActionComplete={() => qc.invalidateQueries({ queryKey: ['run', id] })}
              />
            </>
          )}

          {/* Files Changed */}
          {d.files_changed?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-300">Proposed changes</span>
                {d.files_changed.some((fc) => fc.diff_risk) && (() => {
                  const totalAdded = d.files_changed.reduce((s, fc) => s + (fc.diff_risk?.lines_added ?? 0), 0)
                  const totalRemoved = d.files_changed.reduce((s, fc) => s + (fc.diff_risk?.lines_removed ?? 0), 0)
                  return (
                    <span className="inline-flex items-center gap-2 text-xs px-2 py-0.5 rounded-full bg-emerald-950/30 border border-emerald-800/50 text-emerald-400 font-mono">
                      +{totalAdded} / -{totalRemoved}
                    </span>
                  )
                })()}
              </div>
              {d.files_changed.map((fc) => (
                <div key={fc.path} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/50">
                    <code className="text-sm text-zinc-300 font-mono">{fc.path}</code>
                    <div className="flex items-center gap-2">
                      {fc.diff_risk && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className={`text-xs cursor-default ${riskColor(fc.diff_risk.risk_level)}`}
                            >
                              {fc.diff_risk.risk_level} risk
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="bg-zinc-900 border-zinc-700 text-zinc-300 max-w-xs">
                            <p className="text-xs">{fc.diff_risk.risk_reason}</p>
                            {fc.diff_risk.has_known_good && (
                              <p className="text-xs text-zinc-500 mt-1">
                                +{fc.diff_risk.lines_added} / -{fc.diff_risk.lines_removed} lines,{' '}
                                {fc.diff_risk.changed_regions} region(s)
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-zinc-500 text-xs mb-3">{fc.explanation}</p>
                    <SyntaxHighlighter
                      language={langFromPath(fc.path)}
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: '12px', maxHeight: '400px' }}
                    >
                      {fc.new_content}
                    </SyntaxHighlighter>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-zinc-500">
          {POLLING_STATUSES.has(run.status) ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Prash is working…</span>
            </div>
          ) : (
            <p className="text-sm">No diagnosis available.</p>
          )}

          {/* ── Chat Interface ── */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Ask Prash</span>
            </div>

            {/* Messages */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto p-3 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-sm">
                    <p>Ask about this CI failure:</p>
                    <p className="text-zinc-600 text-xs mt-1">"What went wrong?" · "Explain the fix" · "Should I retry?"</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                          msg.role === 'user'
                            ? 'bg-violet-600 text-white'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {isAiResponding && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 px-3 py-2 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-zinc-800 p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!chatInput.trim() || isAiResponding) return

                    const newMessage: Message = {
                      id: crypto.randomUUID(),
                      role: 'user',
                      content: chatInput.trim(),
                      created_at: new Date().toISOString(),
                    }
                    setMessages((prev) => [...prev, newMessage])
                    sendMessageMutation.mutate(chatInput.trim())
                    setChatInput('')
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about the failure..."
                    className="bg-zinc-900 border-zinc-700 text-zinc-100 text-sm"
                    disabled={isAiResponding}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-500 text-white"
                    disabled={!chatInput.trim() || isAiResponding}
                  >
                    {isAiResponding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4 rotate-45" />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
          </div> {/* Close RIGHT: AI Analysis Panel */}
        </div> {/* Close grid */}
      </div> {/* Close max-w-7xl */}

      {/* ── Sticky action footer ── */}
      {d && !isTerminal && (
        <div className="fixed bottom-0 left-0 md:left-60 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 px-8 py-4">
          {isApplied ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {run.status === 'verified' ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="text-emerald-400 text-sm font-medium">Fix Verified — CI passed on the fix branch.</p>
                      {d.github_pr_url && (
                        <a href={d.github_pr_url} target="_blank" rel="noreferrer"
                          className="text-violet-400 text-xs hover:underline flex items-center gap-1">
                          PR #{d.github_pr_number} <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-5 w-5 text-violet-400 animate-spin" />
                    <div>
                      <p className="text-violet-400 text-sm font-medium">
                        {run.status === 'applying' ? 'Creating PR…' : 'Waiting for CI on fix branch…'}
                      </p>
                      {d.github_pr_url && (
                        <a href={d.github_pr_url} target="_blank" rel="noreferrer"
                          className="text-violet-400 text-xs hover:underline flex items-center gap-1">
                          PR #{d.github_pr_number} <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : isDiagnosedTerminal ? null : (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                disabled={dryRunMutation.isPending}
                onClick={() => dryRunMutation.mutate()}
              >
                {dryRunMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Dry Run
              </Button>
              <Button
                className="bg-violet-600 hover:bg-violet-500 text-white"
                disabled={applyMutation.isPending || !canApply}
                onClick={() => applyMutation.mutate()}
              >
                {applyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Apply Fix
              </Button>
              {!canApply && (
                <p className="text-zinc-500 text-xs">Manual review required.</p>
              )}
            </div>
          )}
        </div>
      )}

      {dryRunResult && (
        <DryRunDialog
          result={dryRunResult}
          onClose={() => setDryRunResult(null)}
          onApply={() => applyMutation.mutate()}
          applying={applyMutation.isPending}
        />
      )}
    </div>
  )
}
