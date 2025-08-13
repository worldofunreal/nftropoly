import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import Clarity from '@microsoft/clarity'

/**
 * Microsoft Clarity integration (client-only)
 * - Initializes when user has granted analytics consent
 * - Provides `$clarity` for manual tagging/events
 * - Identifies authenticated users using ICP Principal and username
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return

  const config = useRuntimeConfig()
  const projectId = (config.public.CLARITY_PROJECT_ID as string) || 'stqeko2g9v'

  const consentKey = 'nftropoly_analytics_consent'
  const hasConsent = () => localStorage.getItem(consentKey) === 'true'

  // Initialize when consent present
  const tryInit = () => {
    if (hasConsent()) {
      try {
        Clarity.init(projectId)
      } catch {
        // ignore init error to avoid crashing app in hackathon phase
      }
    }
  }

  tryInit()

  // Listen for consent changes from UI (Dislaimer modal dispatches this)
  window.addEventListener('analytics-consent-changed', (e: Event) => {
    const detail = (e as CustomEvent<boolean>).detail
    try {
      Clarity.consent(Boolean(detail))
    } catch {
      // noop
    }
    if (detail) tryInit()
  })

  // Attempt to identify user once app is mounted and auth store is available
  nuxtApp.hook('app:mounted', async () => {
    try {
      const { useAuthStore } = await import('@/stores/auth')
      const auth = useAuthStore()

      const identifyIfReady = () => {
        if (!hasConsent()) return
        const principal = auth.icpPrincipal || auth.getIdentity()?.getPrincipal()?.toText()
        const friendlyName = auth.userProfile?.username || auth.userProfile?.displayName || undefined
        if (principal) {
          try {
            Clarity.identify(principal, undefined, undefined, friendlyName)
          } catch {
            // noop
          }
        }
      }

      // Identify immediately if state already loaded
      identifyIfReady()

      // Watch for auth changes and identify again
      const { watch } = await import('vue')
      watch(
        () => [auth.authenticated, auth.userProfile, auth.icpPrincipal],
        () => identifyIfReady(),
        { deep: true }
      )
    } catch {
      // store not ready; ignore
    }
  })

  // Provide clarity instance for manual usage in components via useNuxtApp().$clarity
  return {
    provide: {
      clarity: Clarity,
    },
  }
})


