import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AppLayout from '@/components/AppLayout'
import PageLoader from '@/components/PageLoader'
import { posthog } from '@/lib/posthog'

function PostHogPageTracker() {
  const location = useLocation()
  useEffect(() => {
    posthog.capture('$pageview', { $current_url: window.location.href })
  }, [location.pathname])
  return null
}

const Landing = lazy(() => import('@/pages/Landing'))
const HowItWorks = lazy(() => import('@/pages/HowItWorks'))
const Login = lazy(() => import('@/pages/Login'))
const AuthCallback = lazy(() => import('@/pages/AuthCallback'))
const GitHubAppCallback = lazy(() => import('@/pages/GitHubAppCallback'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Repos = lazy(() => import('@/pages/Repos'))
const Failures = lazy(() => import('@/pages/Failures'))
const History = lazy(() => import('@/pages/History'))
const RunDetail = lazy(() => import('@/pages/RunDetail'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PostHogPageTracker />
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/github-app-callback" element={<GitHubAppCallback />} />

              {/* Protected routes — wrapped in sidebar layout */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/repos" element={<Repos />} />
                <Route path="/failures" element={<Failures />} />
                <Route path="/history" element={<History />} />
                <Route path="/runs/:id" element={<RunDetail />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
