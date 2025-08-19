<template>
  <div v-if="isVisible">
    <!-- Intro.js will render the tour overlay here -->
  </div>
</template>

<script setup lang="ts">
  import introJs from 'intro.js'
  import 'intro.js/introjs.css'
  import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
  import { useOnboarding } from '@/composables/useOnboarding'
  import type { Tour } from 'intro.js/src/packages/tour'

  // Props for customizing the tour
  interface Props {
    steps?: Array<{
      element: string
      intro: string
      position: string
      tooltipClass?: string
    }>
    autoStart?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    steps: () => [],
    autoStart: true,
  })

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

  // Default tour steps - can be overridden via props
  const defaultSteps = [
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
      disableInteraction: false,
    },
    {
      element: '.login-panel-buttons',
      intro:
        'Choose your preferred wallet connection method. We support multiple options for your convenience.',
      position: 'left',
      tooltipClass: 'login-panel-tooltip',
    },
    {
      element: '.metamask-btn',
      intro:
        "Click here to connect with MetaMask. You'll need to sign a message to verify your wallet.",
      position: 'bottom',
      tooltipClass: 'wallet-btn-tooltip',
    },
    {
      element: '.phantom-btn',
      intro: 'Connect with Phantom wallet for Solana-based transactions.',
      // position: 'bottom',
      tooltipClass: 'wallet-btn-tooltip',
    },
    {
      element: '.plug-btn',
      intro: 'Use Plug wallet for Internet Computer (ICP) transactions.',
      // position: 'bottom',
      tooltipClass: 'wallet-btn-tooltip',
    },
    {
      element: '.google-btn',
      intro:
        'Sign in with your Google account for a quick and easy experience.',
      // position: 'bottom',
      tooltipClass: 'wallet-btn-tooltip',
    },
    {
      element: '.internet-identity-btn',
      intro:
        'Connect with Internet Identity for secure, passwordless authentication on the Internet Computer.',
      // position: 'bottom',
      tooltipClass: 'wallet-btn-tooltip',
    },
  ]

  // Conditional registration step
  const registrationStep = {
    element: '.registration-modal',
    intro:
      'Complete your profile setup! Choose a username, customize your avatar, and set your privacy preferences to get started.',
    position: 'center',
    tooltipClass: 'registration-tooltip',
  }

  // Registration process steps
  const registrationProcessSteps = [
    {
      element: '.registration-step-1',
      intro:
        'Step 1: Enter your username. This will be your unique identifier on the platform.',
      position: 'bottom',
      tooltipClass: 'registration-step-tooltip',
    },
    {
      element: '.registration-step-2',
      intro:
        'Step 2: Customize your profile. Choose an avatar and add your bio.',
      position: 'bottom',
      tooltipClass: 'registration-step-tooltip',
    },
    {
      element: '.registration-step-3',
      intro: 'Step 3: Set your privacy preferences and social links.',
      position: 'bottom',
      tooltipClass: 'registration-step-tooltip',
    },
    {
      element: '.create-profile-btn',
      intro:
        'Click "Create Profile" to complete your registration and start exploring NFTropoly!',
      position: 'top',
      tooltipClass: 'create-profile-tooltip',
    },
  ]

  // Use provided steps or default steps
  const tourSteps = computed(() =>
    props.steps.length > 0 ? props.steps : defaultSteps
  )

  // Tour configuration
  const tourConfig: Record<string, unknown> = {
    steps: tourSteps.value,
    disableInteraction: false,
    showProgress: true,
    showBullets: true,
    showStepNumbers: true,
    exitOnOverlayClick: false,
    exitOnEsc: true,
    nextLabel: 'Next',
    prevLabel: 'Previous',
    skipLabel: 'Skip',
    doneLabel: 'Done',
    tooltipClass: 'custom-tooltip',
    highlightClass: 'custom-highlight',
    scrollToElement: true,
    scrollPadding: 50,
    overlayOpacity: 0.5,
    helperElementPadding: 10,
  }

  // Initialize intro.js
  const initTour = async () => {
    // Only run on client side
    if (import.meta.server) return
    
    try {
      introInstance.value = introJs.tour()

      // Configure the tour
      introInstance.value.setOptions(tourConfig)

      // Event handlers
      introInstance.value.onComplete(() => {
        completeOnboarding()
        emit('complete')
        isVisible.value = false
      })

      introInstance.value.onExit(() => {
        emit('skip')
        isVisible.value = false
      })

      introInstance.value.onStart(() => {
        setTimeout(() => {
          forwardEventListeners()
        }, 100)
        emit('start')
      })
    } catch (error) {
      console.error('Failed to initialize tour:', error)
    }

      // Add step change listener to handle interactive elements
      /* introInstance.value.onchange((_targetElement: HTMLElement) => {
      console.log(introInstance.value?.getCurrentStep());
      const currentStep = introInstance.value?.getCurrentStep();
      console.log("Tour step changed to:", currentStep);

      // Remove all existing listeners first
      removeAllInteractiveListeners();

      // Setup event forwarding from helper layer to highlighted element
      // setupEventForwarding(tourSteps.value[currentStep || 0]?.element || "");

      // Add listeners based on current step
      switch (currentStep) {
        case 1: // connect-wallet-btn step
          addConnectWalletListener();
          break;
        case 3: // metamask-btn step
          addMetaMaskListener();
          break;
        case 4: // phantom-btn step
          addPhantomListener();
          break;
        case 5: // plug-btn step
          addPlugListener();
          break;
        case 6: // google-btn step
          addGoogleListener();
          break;
        case 7: // internet-identity-btn step
          addInternetIdentityListener();
          break;
      }
    }); */
  }

  // Setup event forwarding from helper layer to highlighted element
  // const setupEventForwarding = (forwardedElementQuery: string) => {
  //   // Wait a bit for the helper layer to be rendered
  //   setTimeout(() => {
  //     const helperLayer = document.querySelector(".introjs-helperLayer");
  //     const highlightedElement = document.querySelector(forwardedElementQuery);

  //     console.log("helperLayer", helperLayer);
  //     console.log("highlightedElement", highlightedElement);

  //     if (helperLayer && highlightedElement) {
  //       console.log(
  //         "Setting up event forwarding from helper layer to:",
  //         highlightedElement
  //       );

  //       // Forward click events
  //       helperLayer.addEventListener("click", (event) => {
  //         event.preventDefault();
  //         event.stopPropagation();

  //         // Create a new click event and dispatch it on the highlighted element
  //         const clickEvent = new MouseEvent("click", {
  //           bubbles: true,
  //           cancelable: true,
  //           view: window,
  //         });

  //         highlightedElement.dispatchEvent(clickEvent);
  //         console.log("Forwarded click event to highlighted element");
  //       });

  //       // Forward hover events
  //       helperLayer.addEventListener("mouseenter", (event) => {
  //         event.preventDefault();
  //         event.stopPropagation();

  //         const mouseEnterEvent = new MouseEvent("mouseenter", {
  //           bubbles: true,
  //           cancelable: true,
  //           view: window,
  //         });

  //         highlightedElement.dispatchEvent(mouseEnterEvent);
  //         console.log("Forwarded mouseenter event to highlighted element");
  //       });

  //       helperLayer.addEventListener("mouseleave", (event) => {
  //         event.preventDefault();
  //         event.stopPropagation();

  //         const mouseLeaveEvent = new MouseEvent("mouseleave", {
  //           bubbles: true,
  //           cancelable: true,
  //           view: window,
  //         });

  //         highlightedElement.dispatchEvent(mouseLeaveEvent);
  //         console.log("Forwarded mouseleave event to highlighted element");
  //       });

  //       // Forward mousedown and mouseup for better interaction
  //       helperLayer.addEventListener("mousedown", (event) => {
  //         event.preventDefault();
  //         event.stopPropagation();

  //         const mouseDownEvent = new MouseEvent("mousedown", {
  //           bubbles: true,
  //           cancelable: true,
  //           view: window,
  //         });

  //         highlightedElement.dispatchEvent(mouseDownEvent);
  //       });

  //       helperLayer.addEventListener("mouseup", (event) => {
  //         event.preventDefault();
  //         event.stopPropagation();

  //         const mouseUpEvent = new MouseEvent("mouseup", {
  //           bubbles: true,
  //           cancelable: true,
  //           view: window,
  //         });

  //         highlightedElement.dispatchEvent(mouseUpEvent);
  //       });

  //       // Make helper layer look clickable
  //       (helperLayer as HTMLElement).style.cursor = "pointer";
  //       (helperLayer as HTMLElement).style.pointerEvents = "auto";
  //     }
  //   }, 100);
  // };

  // Handler for connect wallet button click during tour
  const handleConnectWalletClick = () => {
    if (introInstance.value && isVisible.value) {
      // Small delay to let the click action complete
      setTimeout(() => {
        introInstance.value?.nextStep()
      }, 300)
    }
  }

  // Handler for MetaMask button click during tour
  const handleMetaMaskClick = () => {
    if (introInstance.value && isVisible.value) {
      setTimeout(() => {
        introInstance.value?.nextStep()
      }, 300)
    }
  }

  // Handler for Phantom button click during tour
  const handlePhantomClick = () => {
    if (introInstance.value && isVisible.value) {
      setTimeout(() => {
        introInstance.value?.nextStep()
      }, 300)
    }
  }

  // Handler for Plug button click during tour
  const handlePlugClick = () => {
    if (introInstance.value && isVisible.value) {
      setTimeout(() => {
        introInstance.value?.nextStep()
      }, 300)
    }
  }

  // Handler for Google button click during tour
  const handleGoogleClick = () => {
    if (introInstance.value && isVisible.value) {
      setTimeout(() => {
        introInstance.value?.nextStep()
      }, 300)
    }
  }

  // Handler for Internet Identity button click during tour
  const handleInternetIdentityClick = () => {
    if (introInstance.value && isVisible.value) {
      setTimeout(() => {
        introInstance.value?.nextStep()
      }, 300)
    }
  }

  // Helper functions to add listeners
  const addConnectWalletListener = () => {
    const connectWalletBtn = document.querySelector('.connect-wallet-btn')
    if (connectWalletBtn) {
      connectWalletBtn.addEventListener('click', handleConnectWalletClick)
    }
  }

  const addMetaMaskListener = () => {
    const metamaskBtn = document.querySelector('.metamask-btn')
    if (metamaskBtn) {
      metamaskBtn.addEventListener('click', handleMetaMaskClick)
    }
  }

  const addPhantomListener = () => {
    const phantomBtn = document.querySelector('.phantom-btn')
    if (phantomBtn) {
      phantomBtn.addEventListener('click', handlePhantomClick)
    }
  }

  const addPlugListener = () => {
    const plugBtn = document.querySelector('.plug-btn')
    if (plugBtn) {
      plugBtn.addEventListener('click', handlePlugClick)
    }
  }

  const addGoogleListener = () => {
    const googleBtn = document.querySelector('.google-btn')
    if (googleBtn) {
      googleBtn.addEventListener('click', handleGoogleClick)
    }
  }

  const addInternetIdentityListener = () => {
    const internetIdentityBtn = document.querySelector('.internet-identity-btn')
    if (internetIdentityBtn) {
      internetIdentityBtn.addEventListener('click', handleInternetIdentityClick)
    }
  }

  // Helper function to remove all listeners
  const removeAllInteractiveListeners = () => {
    const connectWalletBtn = document.querySelector('.connect-wallet-btn')
    const metamaskBtn = document.querySelector('.metamask-btn')
    const phantomBtn = document.querySelector('.phantom-btn')
    const plugBtn = document.querySelector('.plug-btn')
    const googleBtn = document.querySelector('.google-btn')
    const internetIdentityBtn = document.querySelector('.internet-identity-btn')

    if (connectWalletBtn) {
      connectWalletBtn.removeEventListener('click', handleConnectWalletClick)
    }
    if (metamaskBtn) {
      metamaskBtn.removeEventListener('click', handleMetaMaskClick)
    }
    if (phantomBtn) {
      phantomBtn.removeEventListener('click', handlePhantomClick)
    }
    if (plugBtn) {
      plugBtn.removeEventListener('click', handlePlugClick)
    }
    if (googleBtn) {
      googleBtn.removeEventListener('click', handleGoogleClick)
    }
    if (internetIdentityBtn) {
      internetIdentityBtn.removeEventListener(
        'click',
        handleInternetIdentityClick
      )
    }

    // Remove event forwarding listeners
    // removeEventForwardingListeners();
  }

  // Remove event forwarding listeners
  // const removeEventForwardingListeners = () => {
  //   const helperLayer = document.querySelector(".introjs-helperLayer");
  //   if (helperLayer) {
  //     setTimeout(() => {
  //       // Remove all event listeners by cloning and replacing the element
  //       const newHelperLayer = helperLayer.cloneNode(true);
  //       helperLayer.parentNode?.replaceChild(newHelperLayer, helperLayer);
  //     }, 100);
  //   }
  // };

  const forwardEventListeners = () => {
    const helperLayer: HTMLElement | null = document.querySelector(
      '.introjs-helperLayer'
    )

    if (helperLayer) {
      helperLayer.addEventListener('click', event => {
        event.preventDefault()
        event.stopPropagation()
        const currentStep = introInstance.value?.getCurrentStep()

        console.log('currentStep', currentStep)
        const forwardedElementQuery =
          tourSteps.value[currentStep || 0]?.element || ''
        const highlightedElement: HTMLElement | null = document.querySelector(
          forwardedElementQuery
        )

        if (!highlightedElement) return

        switch (currentStep) {
          case 2: {
            const choice = Math.floor(
              ((event.pageY - highlightedElement.getBoundingClientRect().top) /
                highlightedElement.clientHeight) *
                5
            )
            switch (choice) {
              case 0:
                document.querySelector('.internet-identity-btn')?.dispatchEvent(
                  new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                  })
                )
                break
              case 1:
                document.querySelector('.metamask-btn')?.dispatchEvent(
                  new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                  })
                )
                break
              case 2:
                document.querySelector('.phantom-btn')?.dispatchEvent(
                  new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                  })
                )
                break
              case 3:
                document.querySelector('.plug-btn')?.dispatchEvent(
                  new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                  })
                )
                break
              case 4:
                document.querySelector('.google-btn')?.dispatchEvent(
                  new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                  })
                )
                break
            }
            break
          }
          default: {
            // Create a new click event and dispatch it on the highlighted element
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
            })

            highlightedElement.dispatchEvent(clickEvent)
            introInstance.value?.nextStep()
            break
          }
        }

        console.log('Forwarded click event to highlighted element')
      })

      // Forward hover events
      helperLayer.addEventListener('mouseenter', event => {
        event.preventDefault()
        event.stopPropagation()
        const currentStep = introInstance.value?.getCurrentStep()
        const forwardedElementQuery =
          tourSteps.value[currentStep || 0]?.element || ''
        const highlightedElement = document.querySelector(forwardedElementQuery)

        console.log('highlightedElement', highlightedElement)

        if (!highlightedElement) return

        const mouseEnterEvent = new MouseEvent('mouseenter', {
          bubbles: true,
          cancelable: true,
          view: window,
        })

        highlightedElement.dispatchEvent(mouseEnterEvent)
        console.log('Forwarded mouseenter event to highlighted element')
      })

      helperLayer.addEventListener('mouseleave', event => {
        event.preventDefault()
        event.stopPropagation()
        const currentStep = introInstance.value?.getCurrentStep()
        const forwardedElementQuery =
          tourSteps.value[currentStep || 0]?.element || ''
        const highlightedElement = document.querySelector(forwardedElementQuery)

        if (!highlightedElement) return

        const mouseLeaveEvent = new MouseEvent('mouseleave', {
          bubbles: true,
          cancelable: true,
          view: window,
        })

        highlightedElement.dispatchEvent(mouseLeaveEvent)
        console.log('Forwarded mouseleave event to highlighted element')
      })

      // Forward mousedown and mouseup for better interaction
      helperLayer.addEventListener('mousedown', event => {
        event.preventDefault()
        event.stopPropagation()
        const currentStep = introInstance.value?.getCurrentStep()
        const forwardedElementQuery =
          tourSteps.value[currentStep || 0]?.element || ''
        const highlightedElement = document.querySelector(forwardedElementQuery)

        if (!highlightedElement) return

        const mouseDownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window,
        })

        highlightedElement.dispatchEvent(mouseDownEvent)
      })

      helperLayer.addEventListener('mouseup', event => {
        event.preventDefault()
        event.stopPropagation()
        const currentStep = introInstance.value?.getCurrentStep()
        const forwardedElementQuery =
          tourSteps.value[currentStep || 0]?.element || ''
        const highlightedElement = document.querySelector(forwardedElementQuery)

        if (!highlightedElement) return

        const mouseUpEvent = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          view: window,
        })

        highlightedElement.dispatchEvent(mouseUpEvent)
      })

      // Make helper layer look clickable
      ;(helperLayer as HTMLElement).style.cursor = 'pointer'
      ;(helperLayer as HTMLElement).style.pointerEvents = 'auto'
    }
  }

  // Start the tour
  const startTour = () => {
    // Only start if onboarding should be shown
    if (introInstance.value /* && shouldShowOnboarding.value */) {
      isVisible.value = true
      introInstance.value.start()
    }
  }

  // Update tour steps when registration modal becomes visible
  const updateTourForRegistration = () => {
    if (introInstance.value && isVisible.value) {
      // Get current steps from the tour configuration
      const currentSteps = tourSteps.value
      const hasRegistrationStep = currentSteps.some(
        step => step.element === '.registration-modal'
      )

      if (!hasRegistrationStep) {
        // Add the registration step and process steps
        const updatedSteps = [
          ...currentSteps,
          registrationStep,
          ...registrationProcessSteps,
        ]
        introInstance.value.setOptions({ steps: updatedSteps })
      }

      // Wait a bit for the modal to be fully rendered, then go to registration step
      setTimeout(() => {
        const updatedSteps = introInstance.value
          ? (introInstance.value as any)._options?.steps || currentSteps
          : currentSteps
        const registrationStepIndex = updatedSteps.findIndex(
          (step: { element: string }) => step.element === '.registration-modal'
        )
        if (registrationStepIndex !== -1) {
          introInstance.value?.goToStep(registrationStepIndex)
        }
      }, 500)
    }
  }

  // Stop the tour
  const stopTour = () => {
    if (introInstance.value) {
      // Remove all interactive listeners before stopping
      removeAllInteractiveListeners()
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
    updateTourForRegistration,
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
