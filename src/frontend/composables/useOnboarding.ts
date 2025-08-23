import { computed, ref } from 'vue'
import introJs from 'intro.js'
import 'intro.js/introjs.css'
import type { Tour } from 'intro.js/src/packages/tour'
import type { TourStep } from 'intro.js/src/packages/tour/steps'

export const useOnboarding = () => {
  const introInstance = ref<Tour | null>(null)
  // Check if user has completed onboarding
  const hasCompletedOnboarding = ref(false)

  // Check if onboarding should be shown (first-time visitor)
  const shouldShowOnboarding = computed(() => {
    if (import.meta.client) {
      return !localStorage.getItem('nftropoly-onboarding-completed')
    }
    return false
  })

  // Mark onboarding as completed
  const completeOnboarding = () => {
    if (import.meta.client) {
      localStorage.setItem('nftropoly-onboarding-completed', 'true')
      hasCompletedOnboarding.value = true
    }
  }



  // Initialize onboarding state
  const initOnboarding = () => {
    if (import.meta.client) {
      hasCompletedOnboarding.value = !!localStorage.getItem(
        'nftropoly-onboarding-completed'
      )
    }
  }

  // Initialize intro.js
  const initTour = (tourName: string) => {
    switch (tourName) {
      case 'login':
        break
      case 'registration': {
        console.log('tourSteps')
        console.log('tourSteps')
        const loginPanelElement = document.getElementById('login-panel')
        setTimeout(() => {
          console.log(loginPanelElement)
        }, 3000)
        if (!loginPanelElement) return
        const tourSteps: Partial<
          TourStep & {
            onBeforeChange?: (
              targetElement?: HTMLElement,
              direction?: 'forward' | 'backward'
            ) => boolean | Promise<boolean>
          }
        >[] = [
          {
            // element: 'body',
            intro:
              "Welcome to NFTropoly! Your gateway to the world of NFTs on the Internet Computer. Let's explore the key features together.",
            // position: 'center',
          },
          {
            element: '.connect-wallet-btn',
            intro:
              'Start by connecting your wallet to browse, buy, and sell NFTs securely using Internet Identity, MetaMask, Phantom, Plug, or Google.',
            position: 'bottom',
            onBeforeChange: async (_targetElement, direction) => {
              if (direction !== 'forward') loginPanelElement.classList.add('hidden')
              return true
            },
          },
          {
            element: '#internet-identity-btn',
            intro:
              'Connect with Internet Identity for secure, passwordless authentication on the Internet Computer.',
            // position: 'bottom',
            disableInteraction: true,
            onBeforeChange: async (_targetElement, direction) => {
              if (direction === 'forward') loginPanelElement.classList.remove('hidden')
              return true
            },
          },
          {
            element: '#metamask-btn',
            intro:
              "Click here to connect with MetaMask. You'll need to sign a message to verify your wallet.",
            position: 'bottom',
            disableInteraction: true,
          },
          {
            element: '#phantom-btn',
            intro: 'Connect with Phantom wallet for Solana-based transactions.',
            // position: 'bottom',
            disableInteraction: true,
          },
          {
            element: '#plug-btn',
            intro: 'Use Plug wallet for Internet Computer (ICP) transactions.',
            // position: 'bottom',
            disableInteraction: true,
          },
          {
            element: '.login-panel-buttons',
            intro:
              "Let's start by connecting your wallet. We support multiple options for your convenience.",
            position: 'left',
            disableInteraction: false,
            onBeforeChange: async (_targetElement, direction) => {
              if (direction !== 'forward') return false
              return true
            },
          },
          {
            element: '.registration-modal',
            intro:
              'Complete your profile setup! Choose a username, customize your avatar, and set your privacy preferences to get started.',
            position: 'bottom',
          },
          {
            element: '#icp-principal',
            intro:
              'This is your Internet Computer (ICP) principal address. It is used to send and receive ICP tokens.',
            position: 'bottom',
          },
          {
            element: '#evm-address',
            intro:
              'This is your Ethereum (EVM) address. It is used to send and receive Ethereum tokens.',
            position: 'bottom',
          },
          {
            element: '#sol-address',
            intro:
              'This is your Solana address. It is used to send and receive Solana tokens.',
            position: 'bottom',
          },
          {
            element: '#btc-address',
            intro:
              'This is your Bitcoin address. It is used to send and receive Bitcoin tokens.',
            position: 'bottom',
          },
          {
            element: '#username-input',
            intro: 'Enter your username to complete your registration.',
            position: 'bottom',
            disableInteraction: false,
          },
          {
            element: '.create-profile-btn',
            intro:
              'Click "Create Profile" to complete your registration and start exploring NFTropoly!',
            position: 'top',
            onBeforeChange: async (_targetElement, direction) => {
              if (direction !== 'forward') return false
              const usernameStatus = document.getElementById('username-status')
              if (usernameStatus?.textContent?.includes('available'))
                return true
              return false
            },
          },
          {
            element: 'body',
            intro:
              'Congratulations! You have successfully created your profile. You can now start exploring NFTropoly!',
            position: 'bottom',
          },
        ]

        // Only run on client side
        if (import.meta.server) return

        try {
          introInstance.value = introJs.tour()
          const intro = introInstance.value

          // Configure the tour
          intro.setOptions({
            steps: tourSteps,
            disableInteraction: false,
            exitOnOverlayClick: false,
            nextLabel: 'Next',
            hidePrev: true,
            dontShowAgain: false,
            doneLabel: 'Done',
            tooltipClass: 'custom-tooltip',
            highlightClass: 'custom-highlight',
            scrollToElement: true,
            scrollPadding: 50,
            overlayOpacity: 0.5,
            helperElementPadding: 10,
          })

          intro.onBeforeChange(
            async (targetElement, currentStep, direction) => {
              return (
                (await tourSteps[currentStep]?.onBeforeChange?.(
                  targetElement,
                  direction
                )) ?? true
              )
            }
          )

          intro.onStart(() => {
            setTimeout(() => {
              const helperLayer = document.querySelector('.introjs-helperLayer')
              if (!helperLayer) return
              helperLayer.addEventListener('click', forwardEventListeners)
              helperLayer.addEventListener('mouseenter', forwardEventListeners)
              helperLayer.addEventListener('mouseleave', forwardEventListeners)
              helperLayer.addEventListener('mousedown', forwardEventListeners)
              helperLayer.addEventListener('mouseup', forwardEventListeners)
            }, 100)
          })
        } catch (error) {
          console.error('Failed to initialize tour:', error)
        }
        break
      }
    }
  }

  const forwardEventListeners = (event: Event) => {
    event.preventDefault()
    event.stopPropagation()
    if (!(event instanceof MouseEvent)) return
    const helperLayer = event.target as HTMLElement
    const currentStep = introInstance.value?.getCurrentStep()
    const tourSteps = introInstance.value?.getSteps()
    if (!helperLayer || !tourSteps) return
    const forwardListener = !(
      tourSteps[currentStep || 0]?.disableInteraction ?? false
    )
    if (!forwardListener) return
    const highlightedElement = document.elementsFromPoint(
      event.clientX,
      event.clientY
    )[2]

    highlightedElement?.dispatchEvent(
      new Event(event.type, {
        bubbles: true,
        cancelable: true,
      })
    )

    if (event.type === 'click') {
      if (!(highlightedElement instanceof HTMLInputElement))
        introInstance.value?.nextStep()
      else {
        highlightedElement.focus()
      }
    }

    // Make helper layer look clickable
    ;(helperLayer as HTMLElement).style.cursor = 'pointer'
    ;(helperLayer as HTMLElement).style.pointerEvents = 'auto'
  }

  // Start the tour
  const startTour = async (tourName: string) => {
    initTour(tourName)
    if (introInstance.value) {
      introInstance.value.start()
    }
  }

  // Stop the tour
  const stopTour = () => {
    if (introInstance.value) {
      introInstance.value.exit()
    }
  }

  return {
    hasCompletedOnboarding,
    shouldShowOnboarding,
    completeOnboarding,
    initOnboarding,
    startTour,
    stopTour,
    initTour,
  }
}
