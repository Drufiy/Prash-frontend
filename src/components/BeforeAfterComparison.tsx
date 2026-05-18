import { CheckCircle2 } from 'lucide-react'

export default function BeforeAfterComparison() {
  return (
    <section className="relative px-4 sm:px-6 py-16 sm:py-24 lg:py-32 border-b border-white/6">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-yellow-400 text-xs font-semibold uppercase tracking-widest mb-4">Before / After</p>
          <h2 className="text-4xl font-semibold tracking-tight text-white leading-snug mb-6">
            See the difference
          </h2>
          <p className="text-white/65 text-base max-w-2xl mx-auto leading-relaxed">
            CI failures vs. Prash-automated fixes — watch how we transform errors into ready-to-merge PRs.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Before: CI Log Failure */}
          <div className="relative">
            <div className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">Failed CI</div>
            <div className="bg-[#0e0e0e] border border-white/6 rounded-xl overflow-hidden">
              <div className="bg-black/40 border-b border-white/6 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-white/40 font-mono ml-2">GitHub Actions / CI</span>
              </div>
              <div className="p-4 font-mono text-sm text-white/60 space-y-1 overflow-x-auto">
                <div>
                  <span className="text-white/40">$ </span>
                  <span className="text-white/60">npm run test</span>
                </div>
                <div className="text-white/40">
                  <span>&gt; running 23 tests...</span>
                </div>
                <div className="mt-3 text-white/40">
                  <span>FAIL  src/__tests__/api.spec.ts</span>
                </div>
                <div className="mt-2">
                  <span className="text-red-500 font-medium">✕ should handle webhook_pending</span>
                </div>
                <div className="mt-2 text-red-500/80 bg-red-950/30 px-2 py-1 rounded text-xs leading-relaxed">
                  <span>TypeError: Cannot read property 'status' of undefined</span>
                  <div className="mt-1 text-red-500/60">at handleWebhook (src/api.ts:45:12)</div>
                </div>
                <div className="mt-4 text-red-500">
                  <span>Tests:    1 failed, 22 passed</span>
                </div>
                <div className="text-red-500">
                  <span>FAILED  src/__tests__/api.spec.ts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prash badge between */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0a0a0a] border border-yellow-400/40 shadow-xl">
              <div className="w-1 h-1 rounded-full bg-yellow-400" />
            </div>
          </div>

          {/* After: Prash PR */}
          <div className="relative">
            <div className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">Prash Fix</div>
            <div className="bg-[#0e0e0e] border border-white/6 rounded-xl overflow-hidden">
              <div className="bg-black/40 border-b border-white/6 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-xs text-white/40 font-mono ml-2">fix: handle webhook_pending state</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="p-4 font-mono text-sm text-white/60 space-y-1 overflow-x-auto">
                <div className="text-white/40">
                  <span>@@ -42,7 +42,10 @@ export async function handleWebhook</span>
                </div>
                <div className="mt-2 text-white/40">
                  <span>  const webhook = await req.json()</span>
                </div>
                <div className="text-white/40">
                  <span>- if (webhook.action === 'completed') {'{}'}</span>
                </div>
                <div className="text-white/40">
                  <span>+ if (!webhook.status) return res.status(400).json()</span>
                </div>
                <div className="text-emerald-500">
                  <span>+ if (webhook.status === 'webhook_pending') {'{}'}</span>
                </div>
                <div className="text-emerald-500">
                  <span>+   return res.status(202).json({'{'}ready: false{'}'})</span>
                </div>
                <div className="text-emerald-500">
                  <span>+ {'}'}  </span>
                </div>
                <div className="mt-3 text-emerald-500 bg-emerald-950/30 px-2 py-1 rounded text-xs">
                  <span>✓ All checks passed · Ready to merge</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
