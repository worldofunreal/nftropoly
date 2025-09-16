<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Marketplace Admin</h1>
            <p class="mt-2 text-gray-600">Manage marketplace operations and debug issues</p>
          </div>
          <UBadge color="red" variant="soft" size="lg">
            Admin Only
          </UBadge>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Admin Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">All Escrows</h3>
              <p class="text-sm text-gray-500">View all escrow records</p>
            </div>
            <UButton
              @click="loadAllEscrows"
              :loading="loadingEscrows"
              variant="outline"
            >
              Load
            </UButton>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Retry Settlements</h3>
              <p class="text-sm text-gray-500">Retry failed settlements</p>
            </div>
            <UButton
              @click="loadRetryInfo"
              :loading="loadingRetry"
              variant="outline"
            >
              Check
            </UButton>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Debug State</h3>
              <p class="text-sm text-gray-500">Get marketplace debug info</p>
            </div>
            <UButton
              @click="loadDebugState"
              :loading="loadingDebug"
              variant="outline"
            >
              Load
            </UButton>
          </div>
        </div>
      </div>

      <!-- All Escrows -->
      <div v-if="allEscrows.length > 0" class="bg-white rounded-lg shadow-sm border mb-8">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">All Escrows ({{ allEscrows.length }})</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ask ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="[askId, escrow] in allEscrows" :key="askId.toString()">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ askId.toString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getEscrowType(escrow) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatPrincipal(escrow.seller.owner.toString()) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ escrow.buyer?.[0] ? formatPrincipal(escrow.buyer[0].owner.toString()) : 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <UButton
                    @click="handleAdminWithdraw(askId)"
                    color="red"
                    variant="outline"
                    size="sm"
                    :loading="withdrawingEscrows.has(askId.toString())"
                  >
                    Withdraw
                  </UButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Retry Info -->
      <div v-if="retryInfo.length > 0" class="bg-white rounded-lg shadow-sm border mb-8">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Settlements Needing Retry ({{ retryInfo.length }})</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ask ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retry Count
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="askId in retryInfo" :key="askId.toString()">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ askId.toString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Loading...
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Loading...
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Loading...
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <UButton
                    @click="handleRetrySettlement(askId)"
                    color="green"
                    variant="outline"
                    size="sm"
                    :loading="retryingSettlements.has(askId.toString())"
                  >
                    Retry
                  </UButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Debug State -->
      <div v-if="debugState" class="bg-white rounded-lg shadow-sm border">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Debug State</h3>
        </div>
        <div class="p-6">
          <pre class="bg-gray-100 rounded-lg p-4 text-sm overflow-x-auto">{{ debugState }}</pre>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mt-6">
        <UAlert
          icon="i-heroicons-exclamation-triangle"
          color="red"
          variant="soft"
          :title="error"
          :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
          @close="error = null"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { marketplaceService } from '~/services/MarketplaceService'
import type { EscrowRecord } from '../../declarations/marketplace/marketplace.did'

// Meta
definePageMeta({
  title: 'Marketplace Admin',
  description: 'Admin tools for marketplace management',
  middleware: 'admin'
})

// State
const loadingEscrows = ref(false)
const loadingRetry = ref(false)
const loadingDebug = ref(false)
const error = ref<string | null>(null)
const allEscrows = ref<Array<[bigint, EscrowRecord]>>([])
const retryInfo = ref<bigint[]>([])
const debugState = ref<string | null>(null)
const withdrawingEscrows = ref(new Set<string>())
const retryingSettlements = ref(new Set<string>())

// Methods
const loadAllEscrows = async () => {
  try {
    loadingEscrows.value = true
    error.value = null
    
    const result = await marketplaceService.admin_get_all_escrows()
    
    if ('Ok' in result) {
      allEscrows.value = result.Ok
    } else {
      error.value = result.Err.message
    }
  } catch (err) {
    console.error('Failed to load all escrows:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load escrows'
  } finally {
    loadingEscrows.value = false
  }
}

const loadRetryInfo = async () => {
  try {
    loadingRetry.value = true
    error.value = null
    
    retryInfo.value = await marketplaceService.getAsksNeedingRetry()
  } catch (err) {
    console.error('Failed to load retry info:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load retry info'
  } finally {
    loadingRetry.value = false
  }
}

const loadDebugState = async () => {
  try {
    loadingDebug.value = true
    error.value = null
    
    debugState.value = await marketplaceService.getDebugState()
  } catch (err) {
    console.error('Failed to load debug state:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load debug state'
  } finally {
    loadingDebug.value = false
  }
}

const handleAdminWithdraw = async (askId: bigint) => {
  try {
    withdrawingEscrows.value.add(askId.toString())
    
    const result = await marketplaceService.admin_withdraw_escrow(askId)
    
    if ('Ok' in result) {
      // Reload escrows
      await loadAllEscrows()
    } else {
      error.value = result.Err.message
    }
  } catch (err) {
    console.error('Failed to withdraw escrow:', err)
    error.value = err instanceof Error ? err.message : 'Failed to withdraw escrow'
  } finally {
    withdrawingEscrows.value.delete(askId.toString())
  }
}

const handleRetrySettlement = async (askId: bigint) => {
  try {
    retryingSettlements.value.add(askId.toString())
    
    const result = await marketplaceService.retrySettlement(askId)
    
    if ('Ok' in result) {
      // Reload retry info
      await loadRetryInfo()
    } else {
      error.value = result.Err.message
    }
  } catch (err) {
    console.error('Failed to retry settlement:', err)
    error.value = err instanceof Error ? err.message : 'Failed to retry settlement'
  } finally {
    retryingSettlements.value.delete(askId.toString())
  }
}

// Helper functions
const getEscrowType = (escrow: EscrowRecord) => {
  if ('Ask' in escrow.escrow_type) return 'Ask'
  if ('Bid' in escrow.escrow_type) return 'Bid'
  if ('Settlement' in escrow.escrow_type) return 'Settlement'
  return 'Unknown'
}

const formatPrincipal = (principal: string) => {
  return `${principal.slice(0, 6)}...${principal.slice(-4)}`
}

// Lifecycle
onMounted(() => {
  // Auto-load some data
  loadRetryInfo()
})
</script>
