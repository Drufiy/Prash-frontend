import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AppLayout from '@/components/AppLayout'
import { posthog } from '@/lib/posthog'

function PostHogPageTracker() {
  const location = useLocation()
  useEffect(() => {
    posthog.capture('$pageview', { $current_url: window.location.href })
  }, [location.pathname])
  return null
}

import Landing from '@/pages/Landing'
import HowItWorks from '@/pages/HowItWorks'
import Login from '@/pages/Login'
import AuthCallback from '@/pages/AuthCallback'
import GitHubAppCallback from '@/pages/GitHubAppCallback'
import Dashboard from '@/pages/Dashboard'
import Repos from '@/pages/Repos'
import Failures from '@/pages/Failures'
import History from '@/pages/History'
import RunDetail from '@/pages/RunDetail'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PostHogPageTracker />
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
      </AuthProvider>
    </BrowserRouter>
  )
}
