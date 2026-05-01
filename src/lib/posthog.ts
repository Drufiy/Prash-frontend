import posthog from 'posthog-js'

export function initPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY as string
  if (!key) return
  posthog.init(key, {
    api_host: 'https://us.i.posthog.com',
    capture_pageview: false, // we handle this manually via React Router
    capture_pageleave: true,
    persistence: 'localStorage',
  })
}

export { posthog }
