import posthog from 'posthog-js'

export function initPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY as string
  if (!key) return
  posthog.init(key, {
    api_host: 'https://us.i.posthog.com',
    capture_pageview: false,       // handled manually via React Router
    capture_pageleave: true,
    persistence: 'localStorage',
    session_recording: {
      maskAllInputs: false,        // inputs are fine — no passwords on these pages
      maskTextSelector: '[data-ph-mask]', // mark sensitive text with data-ph-mask if needed
    },
  })
}

export { posthog }
