<template>
  <div v-if="isVisible">
    <!-- Intro.js will render the tour overlay here -->
  </div>
</template>

<script setup lang="ts">
  import introJs from 'intro.js'
  import 'intro.js/introjs.css'
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { useOnboarding } from '@/composables/useOnboarding'
  import type { Tour } from 'intro.js/src/packages/tour'
  import type { TourStep } from 'intro.js/src/packages/tour/steps'

  // Emit events for parent components
  const emit = defineEmits<{
    complete: []
    skip: []
    start: []
  }>()

  const { shouldShowOnboarding, completeOnboarding } = useOnboarding()

  // Tour visibility state
  const isVisible = ref(false)
  const introInstance = ref<Tour | null>(null)

  // Initialize intro.js
  const initTour = async () => {
    // Default tour steps - can be overridden via props
    const tourSteps: Partial<
      TourStep & {
        onBeforeChange?: (
          targetElement?: HTMLElement
        ) => boolean | Promise<boolean>
      }
    >[] = [
      {
        // element: 'body',
        intro:
          "Welcome to NFTropoly! Your gateway to the world of NFTs on the Internet Computer. Let's explore the key features together.",
        // position: 'center',
        tooltipClass: 'welcome-tooltip',
      },
      {
        element: '.connect-wallet-btn',
        intro:
          'Start by connecting your wallet to browse, buy, and sell NFTs securely using Internet Identity, MetaMask, Phantom, Plug, or Google.',
        position: 'bottom',
      },
      {
        element: '#internet-identity-btn',
        intro:
          'Connect with Internet Identity for secure, passwordless authentication on the Internet Computer.',
        // position: 'bottom',
        tooltipClass: 'wallet-btn-tooltip',
        disableInteraction: true,
      },
      {
        element: '#metamask-btn',
        intro:
          "Click here to connect with MetaMask. You'll need to sign a message to verify your wallet.",
        position: 'bottom',
        tooltipClass: 'wallet-btn-tooltip',
        disableInteraction: true,
      },
      {
        element: '#phantom-btn',
        intro: 'Connect with Phantom wallet for Solana-based transactions.',
        // position: 'bottom',
        tooltipClass: 'wallet-btn-tooltip',
        disableInteraction: true,
      },
      {
        element: '#plug-btn',
        intro: 'Use Plug wallet for Internet Computer (ICP) transactions.',
        // position: 'bottom',
        tooltipClass: 'wallet-btn-tooltip',
        disableInteraction: true,
      },
      {
        element: '.login-panel-buttons',
        intro:
          "Let's start by connecting your wallet. We support multiple options for your convenience.",
        position: 'left',
        tooltipClass: 'login-panel-tooltip',
        disableInteraction: false,
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
        prevLabel: 'Previous',
        doneLabel: 'Done',
        tooltipClass: 'custom-tooltip',
        highlightClass: 'custom-highlight',
        scrollToElement: true,
        scrollPadding: 50,
        overlayOpacity: 0.5,
        helperElementPadding: 10,
      })

      // Event handlers
      intro.onComplete(() => {
        completeOnboarding()
        emit('complete')
        // chooseWalletTour()
        isVisible.value = false
      })

      intro.onExit(() => {
        emit('skip')
        isVisible.value = false
      })

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
        emit('start')
      })
    } catch (error) {
      console.error('Failed to initialize tour:', error)
    }
  }

  const registrationModalTour = () => {
    const tourSteps: Partial<
      TourStep & {
        onBeforeChange?: (
          targetElement?: HTMLElement
        ) => boolean | Promise<boolean>
      }
    >[] = [
      {
        element: '.registration-modal',
        intro:
          'Complete your profile setup! Choose a username, customize your avatar, and set your privacy preferences to get started.',
        position: 'bottom',
        tooltipClass: 'registration-tooltip',
      },
      {
        element: '#icp-principal',
        intro:
          'This is your Internet Computer (ICP) principal address. It is used to send and receive ICP tokens.',
        position: 'bottom',
        tooltipClass: 'registration-tooltip',
      },
      {
        element: '#evm-address',
        intro:
          'This is your Ethereum (EVM) address. It is used to send and receive Ethereum tokens.',
        position: 'bottom',
        tooltipClass: 'registration-tooltip',
      },
      {
        element: '#sol-address',
        intro:
          'This is your Solana address. It is used to send and receive Solana tokens.',
        position: 'bottom',
        tooltipClass: 'registration-tooltip',
      },
      {
        element: '#btc-address',
        intro:
          'This is your Bitcoin address. It is used to send and receive Bitcoin tokens.',
        position: 'bottom',
        tooltipClass: 'registration-tooltip',
      },
      {
        element: '#username-input',
        intro: 'Enter your username to complete your registration.',
        position: 'bottom',
        tooltipClass: 'registration-tooltip',
        disableInteraction: false,
      },
      {
        element: '.create-profile-btn',
        intro:
          'Click "Create Profile" to complete your registration and start exploring NFTropoly!',
        position: 'top',
        tooltipClass: 'create-profile-tooltip',
        onBeforeChange: async () => {
          const usernameStatus = document.getElementById('username-status')
          if (usernameStatus?.textContent?.includes('available')) return true
          return false
        },
      },
      {
        element: 'body',
        intro:
          'Congratulations! You have successfully created your profile. You can now start exploring NFTropoly!',
        position: 'bottom',
        tooltipClass: 'registration-tooltip',
      },
    ]

    introInstance.value = introJs.tour()
    const intro = introInstance.value

    intro.setOptions({
      steps: tourSteps,
      disableInteraction: false,
      exitOnOverlayClick: false,
      exitOnEsc: true,
      nextLabel: 'Next',
      prevLabel: 'Previous',
      doneLabel: 'Done',
      tooltipClass: 'custom-tooltip',
      highlightClass: 'custom-highlight',
      scrollToElement: true,
      scrollPadding: 50,
      overlayOpacity: 0.5,
      helperElementPadding: 10,
    })

    intro.onStart(() => {
      setTimeout(() => {
        const helperLayer = document.querySelector('.introjs-helperLayer')
        if (!helperLayer) return
        helperLayer.addEventListener('click', forwardEventListeners)
        helperLayer.addEventListener('mouseenter', forwardEventListeners)
        helperLayer.addEventListener('mouseleave', forwardEventListeners)
        helperLayer.addEventListener('mousedown', forwardEventListeners)
        helperLayer.addEventListener('mouseup', forwardEventListeners)
      }, 1000)
    })

    intro.onBeforeChange(async (targetElement, currentStep) => {
      return (
        (await tourSteps[currentStep]?.onBeforeChange?.(targetElement)) ?? true
      )
    })

    intro.start()
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
  const startTour = () => {
    // Only start if onboarding should be shown
    if (introInstance.value /* && shouldShowOnboarding.value */) {
      isVisible.value = true
      introInstance.value.start()
    }
  }

  // Stop the tour
  const stopTour = () => {
    if (introInstance.value) {
      // Remove all interactive listeners before stopping
      // removeAllInteractiveListeners()
      introInstance.value.exit()
      isVisible.value = false
    }
  }

  // Watch for changes in shouldShowOnboarding (but don't auto-start)
  // The tour will be started manually after disclaimer is closed
  watch(
    shouldShowOnboarding,
    newValue => {
      // Only log the state, don't auto-start
      console.log('Onboarding should show:', newValue)
    },
    { immediate: true }
  )

  // Initialize on mount
  onMounted(async () => {
    await initTour()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    if (introInstance.value) {
      // Remove all interactive listeners
      // removeAllInteractiveListeners();
      introInstance.value.exit()
    }
  })

  // Expose methods for parent components
  defineExpose({
    startTour,
    stopTour,
    registrationModalTour,
  })
</script>

<style scoped>
  /* Custom styles for the tour */
  :deep(.custom-tooltip) {
    background: #1f2937;
    color: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    max-width: 300px;
    font-size: 14px;
    line-height: 1.5;
  }

  :deep(.welcome-tooltip) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    border-radius: 12px !important;
    padding: 24px !important;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4) !important;
    max-width: 400px !important;
    font-size: 16px !important;
    line-height: 1.6 !important;
    text-align: center !important;
    font-weight: 500 !important;
  }

  :deep(.registration-tooltip) {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
    color: white !important;
    border-radius: 12px !important;
    padding: 20px !important;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3) !important;
    max-width: 350px !important;
    font-size: 15px !important;
    line-height: 1.5 !important;
    text-align: center !important;
  }

  :deep(.login-panel-tooltip) {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
    color: white !important;
    border-radius: 12px !important;
    padding: 20px !important;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3) !important;
    max-width: 350px !important;
    font-size: 15px !important;
    line-height: 1.5 !important;
    text-align: center !important;
  }

  :deep(.wallet-btn-tooltip) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    border-radius: 10px !important;
    padding: 16px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
    max-width: 300px !important;
    font-size: 14px !important;
    line-height: 1.4 !important;
    text-align: center !important;
  }

  :deep(.registration-step-tooltip) {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%) !important;
    color: white !important;
    border-radius: 10px !important;
    padding: 16px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
    max-width: 300px !important;
    font-size: 14px !important;
    line-height: 1.4 !important;
    text-align: center !important;
  }

  :deep(.create-profile-tooltip) {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%) !important;
    color: #333 !important;
    border-radius: 10px !important;
    padding: 16px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
    max-width: 300px !important;
    font-size: 14px !important;
    line-height: 1.4 !important;
    text-align: center !important;
    font-weight: 600 !important;
  }

  :deep(.custom-highlight) {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
    border-radius: 8px;
    z-index: 1000;
  }

  :deep(.introjs-tooltip) {
    background: #1f2937 !important;
    color: white !important;
    border-radius: 8px !important;
    padding: 16px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
    max-width: 300px !important;
    font-size: 14px !important;
    line-height: 1.5 !important;
  }

  :deep(.introjs-button) {
    background: #3b82f6 !important;
    color: white !important;
    border: none !important;
    border-radius: 6px !important;
    padding: 8px 16px !important;
    font-size: 14px !important;
    cursor: pointer !important;
    transition: background-color 0.2s !important;
  }

  :deep(.introjs-button:hover) {
    background: #2563eb !important;
  }

  :deep(.introjs-skipbutton) {
    background: #6b7280 !important;
  }

  :deep(.introjs-skipbutton:hover) {
    background: #4b5563 !important;
  }

  :deep(.introjs-arrow) {
    border-color: #1f2937 !important;
  }

  :deep(.introjs-arrow.top) {
    border-bottom-color: #1f2937 !important;
  }

  :deep(.introjs-arrow.bottom) {
    border-top-color: #1f2937 !important;
  }

  :deep(.introjs-arrow.left) {
    border-right-color: #1f2937 !important;
  }

  :deep(.introjs-arrow.right) {
    border-left-color: #1f2937 !important;
  }

  /* Mobile-friendly adjustments */
  @media (max-width: 768px) {
    :deep(.introjs-tooltip) {
      max-width: 280px !important;
      margin: 10px !important;
    }

    :deep(.introjs-button) {
      padding: 10px 12px !important;
      font-size: 13px !important;
    }
  }
</style>
