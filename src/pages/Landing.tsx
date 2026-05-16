import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Code2, Cpu, ChevronRight,
  Clock, Search, GitPullRequest, CheckCircle2,
} from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { posthog } from '@/lib/posthog'
import BeforeAfterComparison from '@/components/BeforeAfterComparison'
import HowItWorksSticky from '@/components/HowItWorksSticky'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Landing() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true })
  }, [user, loading, navigate])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    const hero = heroRef.current
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove)
      return () => hero.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const agents = [
    {
      icon: Search,
      title: 'Failure Diagnosis',
      description: 'Analyzes CI logs and pinpoints root causes automatically within seconds of a failure.',
      badge: 'On CI failure',
      color: 'from-yellow-500/20 to-transparent',
      borderHover: 'hover:border-yellow-500/50',
    },
    {
      icon: GitPullRequest,
      title: 'Automated Fixes',
      description: 'Generates validated fixes and opens a ready-to-merge pull request automatically.',
      badge: 'Automatic',
      color: 'from-yellow-400/20 to-transparent',
      borderHover: 'hover:border-yellow-400/50',
    },
    {
      icon: CheckCircle2,
      title: 'PR Verification',
      description: 'Runs the full CI pipeline on every fix before marking it verified and complete.',
      badge: 'On every run',
      color: 'from-yellow-300/20 to-transparent',
      borderHover: 'hover:border-yellow-300/50',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased relative">

      {/* Background base & noise overlay */}
      <div className="fixed inset-0 bg-[#0a0a0a] pointer-events-none" />
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'64\' height=\'64\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' result=\'noise\'\/%3E%3C/filter%3E%3Crect width=\'64\' height=\'64\' fill=\'white\' filter=\'url(%23noise)\'\/%3E%3C/svg%3E")' }}
      />
      {/* Hero radial glow */}
      <div className="fixed top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-400 opacity-[0.06] blur-[120px] pointer-events-none rounded-full" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/6 bg-[#0a0a0a]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Prash" className="w-6 h-6 rounded-md object-contain" />
            <span className="text-sm font-medium tracking-tight text-white">Prash</span>
            <span className="text-xs text-white/40 font-normal ml-0.5">by Drufiy</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <button
              onClick={() => navigate('/how-it-works')}
              className="hover:text-white transition-colors"
            >
              How it works
            </button>
            <a href="#agents" className="hover:text-white transition-colors">Agents</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block"
            >
              Sign in
            </button>
            <Button
              size="sm"
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-medium rounded-lg px-4 h-8 text-sm"
              onClick={() => navigate('/login')}
            >
              Get started
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative px-4 sm:px-6 pt-32 sm:pt-40 pb-20 overflow-hidden">
        {/* Cursor-following glow - only on desktop, positioned absolutely within hero */}
        <motion.div
          className="pointer-events-none absolute w-80 h-80 bg-yellow-400 rounded-full mix-blend-screen blur-3xl hidden lg:block"
          animate={{
            x: mousePos.x - 160,
            y: mousePos.y - 160,
            opacity: 0.03,
          }}
          transition={{ type: 'tween', duration: 0.3 }}
        />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="text-center"
          >
            {/* Status pill */}
            <motion.div variants={fadeUp} className="mb-8 flex items-center justify-center">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-white/65 font-medium">Early access · onboarding design partners</span>
              </div>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-6xl font-medium tracking-tighter leading-[1.1] mb-8 text-white"
            >
              CI that{' '}
              <span className="relative">
                <span className="text-yellow-400">fixes itself.</span>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg text-white/65 mb-10 leading-relaxed max-w-3xl mx-auto"
            >
              Prash watches your GitHub Actions, diagnoses failures, and ships a verified PR automatically.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-medium px-8 h-12 text-base rounded-lg transition-all"
                onClick={() => navigate('/login')}
              >
                Install the GitHub App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <button
                onClick={() => { posthog.capture('demo_viewed', { source: 'hero_cta' }); window.location.href = '/dashboard?demo=true' }}
                className="text-white/65 hover:text-white transition-colors text-base font-medium"
              >
                Watch 60s demo →
              </button>
            </motion.div>

            {/* Product screenshot - Dashboard */}
            <motion.div
              variants={fadeUp}
              className="relative rounded-xl overflow-hidden border border-white/6 bg-[#0e0e0e]"
            >
              {/* Dashboard UI */}
              <div className="aspect-video flex flex-col">
                {/* Header */}
                <div className="bg-black/60 border-b border-white/6 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs text-white/40 font-mono">Aradhya648/Iris</span>
                  </div>
                  <div className="text-xs text-white/40">3 minutes ago</div>
                </div>

                {/* Status flow */}
                <div className="bg-black/40 border-b border-white/6 px-6 py-4 flex items-center gap-8">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 mx-auto mb-1" />
                    <p className="text-xs text-white/60">Detected</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 mx-auto mb-1 flex items-center justify-center">
                      <span className="text-xs text-white font-medium">2</span>
                    </div>
                    <p className="text-xs text-white/60">Diagnosing</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 mx-auto mb-1" />
                    <p className="text-xs text-white/60">Fix Ready</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 mx-auto mb-1" />
                    <p className="text-xs text-white/60">Applying</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 mx-auto mb-1" />
                    <p className="text-xs text-white/60">Verified</p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex">
                  {/* Left: CI Logs */}
                  <div className="flex-1 border-r border-white/6 p-4 overflow-hidden">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-3">CI Logs</p>
                    <div className="font-mono text-xs text-white/50 space-y-0.5">
                      <div>1  === 0_test.txt ===</div>
                      <div>2  2026-05-10T11:44 Current runner version: '2.334.0'</div>
                      <div>3  2026-05-10T11:44 ##[group]Image Provisioner</div>
                      <div>4  2026-05-10T11:44 Hosted Compute Agent</div>
                      <div className="text-red-500/80">5  Error: Cannot read property 'status' of undefined</div>
                      <div>6  at handleWebhook (src/api.ts:45)</div>
                    </div>
                  </div>

                  {/* Right: AI Analysis */}
                  <div className="flex-1 p-4 bg-black/40 flex flex-col items-center justify-center">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-3">AI Analysis</p>
                    <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-yellow-400 rounded-full mb-3" />
                    <p className="text-xs text-white/60">Prash is analyzing...</p>
                  </div>
                </div>
              </div>

              {/* Yellow glow underneath */}
              <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-yellow-400 opacity-[0.08] blur-3xl pointer-events-none" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <BeforeAfterComparison />

      {/* Agents - Asymmetric Layout */}
      <section id="agents" className="px-4 sm:px-6 py-32 border-b border-white/6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-yellow-400 text-xs font-medium uppercase tracking-widest mb-3">How it works</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-medium tracking-tight mb-6 text-white">Three specialized agents</motion.h2>
            <motion.p variants={fadeUp} className="text-white/65 max-w-2xl mx-auto text-base">
              Working in concert to diagnose failures, generate fixes, and verify every solution passes CI.
            </motion.p>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {agents.map((agent, idx) => {
              const Icon = agent.icon
              const isMiddle = idx === 1
              return (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className={`group relative rounded-xl border border-white/6 bg-[#0e0e0e] overflow-hidden transition-all duration-300 hover:border-yellow-400/30 hover:shadow-lg hover:shadow-yellow-400/10 ${
                    isMiddle ? 'md:col-span-2' : 'md:col-span-1'
                  }`}
                >
                  <div className="p-6 flex flex-col h-full">
                    <div className="w-10 h-10 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="inline-block text-[10px] px-2.5 py-1 rounded-full bg-yellow-400/10 text-yellow-400/80 border border-yellow-400/20 mb-4 font-medium w-fit">
                      {agent.badge}
                    </span>
                    <h3 className="font-medium text-base mb-3 text-white">{agent.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed flex-1">{agent.description}</p>

                    {isMiddle && (
                      <div className="mt-8 pt-6 border-t border-white/6">
                        <p className="text-xs text-white/40 uppercase tracking-widest font-medium mb-3">Example fix</p>
                        <div className="bg-black/60 rounded-lg p-4 font-mono text-xs space-y-1.5 overflow-x-auto">
                          <div className="text-white/30">
                            <span>@@ -42,3 +42,5 @@ export async function</span>
                          </div>
                          <div className="text-white/40">
                            <span>  const response = await fetch(url)</span>
                          </div>
                          <div className="text-emerald-500/80">
                            <span>+ if (!response.ok) {'{'}return handle_error(response){'}'}  </span>
                          </div>
                          <div className="text-emerald-500/80">
                            <span>+ return response.json()</span>
                          </div>
                          <div className="mt-3 text-emerald-400 text-xs">
                            <span>✓ All checks passed</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatedSection>
        </div>
      </section>

      {/* How it works — Sticky scroll */}
      <HowItWorksSticky />

      {/* Why Prash */}
      <section className="px-4 sm:px-6 py-32 border-b border-white/6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-yellow-400 text-xs font-medium uppercase tracking-widest mb-3">Why Prash</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-medium tracking-tight mb-6 text-white">Built for the 2am CI failure</motion.h2>
            <motion.p variants={fadeUp} className="text-white/65 text-base max-w-xl mx-auto">
              When your builds break in the middle of a sprint.
            </motion.p>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: 'Sub-5 minute diagnosis',
                desc: 'Root cause in seconds, not hours of manual log trawling.',
                stat: '~8s',
              },
              {
                icon: Code2,
                title: 'Automated fixes that work',
                desc: 'Verified through your full CI pipeline before opening the PR.',
                stat: '73%',
              },
              {
                icon: Cpu,
                title: 'Zero config overhead',
                desc: 'Install the GitHub App. Prash figures everything else out.',
                stat: '0',
              },
            ].map(({ icon: Icon, title, desc, stat }, idx) => (
              <motion.div key={idx} variants={fadeUp} className="flex flex-col p-6 rounded-xl border border-white/6 bg-[#0e0e0e] hover:border-yellow-400/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-lg font-medium text-yellow-400">{stat}</div>
                </div>
                <h3 className="font-medium text-base mb-2 text-white">{title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </AnimatedSection>

        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-32">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute -inset-20 bg-yellow-400/5 blur-3xl rounded-full pointer-events-none" />
          <AnimatedSection className="relative z-10">
            <motion.h2 variants={fadeUp} className="text-5xl font-medium tracking-tight mb-6 text-white">
              Stop debugging CI
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/65 text-base mb-10">
              Free during early access. No credit card.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Button
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-medium px-10 h-12 text-base rounded-lg transition-all"
                onClick={() => navigate('/login')}
              >
                Install the GitHub App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/6 bg-white/[0.005]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12 pb-12 border-b border-white/6">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.svg" alt="Prash" className="w-6 h-6 rounded-md object-contain" />
                <span className="text-sm font-medium text-white">Prash by Drufiy</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed max-w-xs mb-4">
                CI failures diagnosed and fixed automatically.
              </p>
              <p className="text-xs text-white/40 font-medium">Built in Delhi</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-white/80 uppercase tracking-widest mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li><button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors">How it works</button></li>
                <li><a href="#agents" className="hover:text-white transition-colors">Agents</a></li>
                <li><a href="https://github.com/Drufiy/Prash" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-medium text-white/80 uppercase tracking-widest mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li><a href="https://x.com/Drufiy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter/X</a></li>
                <li><a href="mailto:hi@drufiy.com" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-medium text-white/80 uppercase tracking-widest mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="text-xs text-white/40 flex items-center justify-between">
            <p>© 2026 Drufiy, Inc.</p>
            {/* TODO: Add GitHub star count badge */}
          </div>
        </div>
      </footer>
    </div>
  )
}
