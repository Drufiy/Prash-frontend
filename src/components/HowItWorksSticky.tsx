import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { GitBranch, Search, GitPullRequest, CheckCircle2 } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Connect your repo',
    description: 'Install via GitHub App in 30 seconds. Works with any existing workflow.',
    icon: GitBranch,
    state: 'install',
  },
  {
    number: '02',
    title: 'Detect & diagnose',
    description: 'Prash watches your GitHub Actions and analyzes failures instantly as they happen.',
    icon: Search,
    state: 'diagnose',
  },
  {
    number: '03',
    title: 'Fix & create PR',
    description: 'Automatic fixes are generated, tested, and a PR is opened and ready for review.',
    icon: GitPullRequest,
    state: 'fix',
  },
  {
    number: '04',
    title: 'Verify & ship',
    description: 'All CI tests pass before Prash marks the fix verified. No false positives.',
    icon: CheckCircle2,
    state: 'verify',
  },
]

// Visual states for the left side screenshot
const VisualState = ({ state }: { state: string }) => {
  const baseClasses = 'w-full h-full rounded-lg border border-white/6 bg-[#0e0e0e] overflow-hidden flex flex-col'

  switch (state) {
    case 'install':
      return (
        <div className={baseClasses}>
          <div className="bg-black/40 border-b border-white/6 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            </div>
            <span className="text-xs text-white/40 font-mono ml-2">GitHub OAuth Setup</span>
          </div>
          <div className="flex-1 p-4 font-mono text-sm text-white/60 space-y-2">
            <div className="text-white/40">$ authorize GitHub App</div>
            <div className="text-yellow-400">⚙ Requesting permissions...</div>
            <div className="text-white/40 mt-4">✓ workflows: read</div>
            <div className="text-white/40">✓ pull-requests: write</div>
            <div className="text-white/40">✓ checks: write</div>
          </div>
        </div>
      )

    case 'diagnose':
      return (
        <div className={baseClasses}>
          <div className="bg-black/40 border-b border-white/6 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            </div>
            <span className="text-xs text-white/40 font-mono ml-2">CI Failure Detected</span>
          </div>
          <div className="flex-1 p-4">
            <div className="space-y-3">
              <div className="bg-red-950/40 border border-red-900/40 rounded p-3">
                <p className="text-xs text-red-400 font-mono">TypeError: Cannot read 'status' of undefined</p>
              </div>
              <div className="bg-yellow-950/40 border border-yellow-900/40 rounded p-3">
                <p className="text-xs text-yellow-400 font-medium">🔍 Analyzing logs...</p>
              </div>
              <div className="text-white/40 text-xs space-y-1">
                <div>Checking 23 workflow runs</div>
                <div>Comparing with patterns</div>
                <div className="text-white/60">Models: code-analysis, type-checking</div>
              </div>
            </div>
          </div>
        </div>
      )

    case 'fix':
      return (
        <div className={baseClasses}>
          <div className="bg-black/40 border-b border-white/6 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            </div>
            <span className="text-xs text-white/40 font-mono ml-2">fix: handle undefined status</span>
          </div>
          <div className="flex-1 p-4 font-mono text-xs overflow-x-auto">
            <div className="space-y-1 text-white/60">
              <div className="text-white/40">@@ -42,3 +42,6 @@</div>
              <div className="text-white/40">  if (!webhook) return</div>
              <div className="text-emerald-500">+ if (!webhook.status) {'{}'}</div>
              <div className="text-emerald-500">+   throw new Error('Missing status')</div>
              <div className="text-emerald-500">+ {'}'}</div>
              <div className="mt-3 text-emerald-400">✓ PR opened #1024</div>
            </div>
          </div>
        </div>
      )

    case 'verify':
    default:
      return (
        <div className={baseClasses}>
          <div className="bg-black/40 border-b border-white/6 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs text-white/40 font-mono ml-2">All checks passed</span>
            </div>
            <div className="text-emerald-400 text-xs font-medium">VERIFIED</div>
          </div>
          <div className="flex-1 p-4 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-emerald-400 text-sm font-medium mb-2">Fix Verified</p>
            <p className="text-white/40 text-xs text-center">
              CI passing on fix branch<br />Ready to merge
            </p>
          </div>
        </div>
      )
  }
}

export default function HowItWorksSticky() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.2', 'end 0.8'],
  })

  // Map scroll progress to step index (0-3)
  const stepIndex = useTransform(scrollYProgress, [0, 1], [0, 3])

  return (
    <section ref={containerRef} className="relative px-4 sm:px-6 py-32 border-b border-white/6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.p className="text-yellow-400 text-xs font-medium uppercase tracking-widest mb-4">How it works</motion.p>
          <motion.h2 className="text-4xl font-medium tracking-tight mb-6 text-white">
            From failure to fix in four steps
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Sticky visual state */}
          <div className="hidden lg:block lg:sticky lg:top-32 lg:h-fit">
            <div className="aspect-square">
              <motion.div key={`state-${Math.round(stepIndex.get())}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <VisualState state={steps[Math.round(stepIndex.get())].state} />
              </motion.div>
            </div>
          </div>

          {/* Right: Scrollable steps */}
          <div className="space-y-6">
            {steps.map((step, idx) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  viewport={{ once: true, margin: '-100px' }}
                  className="flex gap-6 p-6 rounded-xl border border-white/6 bg-[#0e0e0e] hover:border-yellow-400/30 transition-all"
                >
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-yellow-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-yellow-400/60 font-mono font-medium">{step.number}</span>
                      <h3 className="text-lg font-medium text-white">{step.title}</h3>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
