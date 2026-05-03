import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

export default function GitHubAppCallback() {
  const navigate = useNavigate()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const params = new URLSearchParams(window.location.search)
    const installation_id = params.get('installation_id')
    const setup_action = params.get('setup_action')

    if (!installation_id) {
      toast.error('GitHub App installation failed — no installation ID received.')
      navigate('/repos', { replace: true })
      return
    }

    api('/auth/github-app/register', {
      method: 'POST',
      body: JSON.stringify({ installation_id: parseInt(installation_id), setup_action }),
    })
      .then(() => {
        toast.success('GitHub App installed! You can now connect org and collab repos.')
        navigate('/repos', { replace: true })
      })
      .catch(() => {
        toast.error('Failed to register GitHub App installation. Please try again.')
        navigate('/repos', { replace: true })
      })
  }, [navigate])

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950">
      <div className="space-y-3 w-64 text-center">
        <p className="text-zinc-400 text-sm">Installing GitHub App…</p>
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  )
}
