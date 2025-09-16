<template>
  <div class="wallet-connection">
    <!-- Connected State -->
    <div v-if="isConnected" class="connected-state">
      <UButton
        :loading="disconnecting"
        variant="outline"
        class="wallet-button"
        @click="handleDisconnect"
      >
        <UIcon
          :name="connectedWalletInfo?.icon || 'i-heroicons-wallet'"
          class="w-4 h-4 mr-2"
        />
        <span class="hidden sm:inline">{{
          connectedWalletInfo?.name || 'Wallet'
        }}</span>
        <span class="sm:hidden">{{ shortAddress }}</span>
      </UButton>
    </div>

    <!-- Disconnected State -->
    <div v-else class="disconnected-state">
      <UDropdown :items="walletItems" :popper="{ placement: 'bottom-end' }">
        <UButton :loading="connecting" class="wallet-button">
          <UIcon name="i-heroicons-wallet" class="w-4 h-4 mr-2" />
          Connect Wallet
          <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 ml-2" />
        </UButton>
      </UDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import {
    useWallet,
    useWalletStatus,
    useWalletSelection,
  } from '~/composables/useWallet'

  // Composables
  const { isConnected, connectedWalletInfo, disconnect, disconnecting } =
    useWallet()
  const { shortAddress } = useWalletStatus()
  const { walletInfos, selectWallet, canConnect, connecting } =
    useWalletSelection()

  // Computed
  const walletItems = computed(() => [
    [
      {
        label: 'Available Wallets',
        slot: 'header',
      },
    ],
    ...walletInfos.value.map(wallet => ({
      label: wallet.name,
      icon: wallet.icon,
      disabled: !canConnect(wallet.type),
      click: () => handleConnect(wallet.type),
    })),
    [
      {
        label: 'Learn More',
        icon: 'i-heroicons-information-circle',
        click: () => showWalletInfo(),
      },
    ],
  ])

  // Methods
  async function handleConnect(type: string) {
    try {
      await selectWallet(type as 'ii' | 'plug' | 'metamask' | 'phantom')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      // Could show a toast notification here
    }
  }

  async function handleDisconnect() {
    try {
      await disconnect()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      // Could show a toast notification here
    }
  }

  function showWalletInfo() {
    // Could open a modal or navigate to a help page
    console.log('Show wallet info')
  }
</script>

<style scoped>
  .wallet-connection {
    @apply inline-block;
  }

  .wallet-button {
    @apply min-w-0;
  }

  .connected-state .wallet-button {
    @apply border-green-200 text-green-700 hover:border-green-300 hover:text-green-800 dark:border-green-800 dark:text-green-300 dark:hover:border-green-700 dark:hover:text-green-200;
  }

  .disconnected-state .wallet-button {
    @apply border-gray-200 text-gray-700 hover:border-gray-300 hover:text-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-gray-200;
  }
</style>
