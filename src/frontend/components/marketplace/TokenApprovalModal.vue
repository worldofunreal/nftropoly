<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Approve Tokens for Marketplace
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="closeModal"
          />
        </div>
      </template>

      <div class="space-y-6">
        <!-- Info Alert -->
        <UAlert
          icon="i-heroicons-information-circle"
          color="blue"
          variant="soft"
          title="Token Approval Required"
          description="You need to approve tokens for the marketplace before you can use them for bidding or payments. This allows the marketplace to transfer your tokens when needed."
        />

        <!-- Approval Amount Input -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white">
            Approval Amount
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Token Selection -->
            <UFormGroup label="Token" name="token">
              <USelectMenu
                v-model="selectedToken"
                :options="availableTokens"
                placeholder="Select a token"
                value-attribute="canisterId"
                option-attribute="symbol"
                class="w-full"
              >
                <template #option="{ option: token }">
                  <div class="flex items-center space-x-2">
                    <div
                      class="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
                    >
                      <span class="text-xs font-medium">{{
                        token.symbol.charAt(0)
                      }}</span>
                    </div>
                    <span>{{ token.name }} ({{ token.symbol }})</span>
                  </div>
                </template>
              </USelectMenu>
            </UFormGroup>

            <!-- Amount Input -->
            <UFormGroup label="Amount" name="amount">
              <UInput
                v-model="approvalAmount"
                type="number"
                :min="0"
                :step="getTokenStep()"
                placeholder="Enter amount"
                class="w-full"
              >
                <template #trailing>
                  <span class="text-gray-500 dark:text-gray-400 text-sm">
                    {{ selectedToken?.symbol || '' }}
                  </span>
                </template>
              </UInput>
            </UFormGroup>
          </div>

          <!-- Balance Info -->
          <div
            v-if="selectedToken"
            class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
          >
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400"
                >Your Balance:</span
              >
              <span class="font-medium text-gray-900 dark:text-white">
                {{ formatTokenAmount(tokenBalance, selectedToken.decimals) }}
                {{ selectedToken.symbol }}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm mt-1">
              <span class="text-gray-600 dark:text-gray-400"
                >Currently Approved:</span
              >
              <span class="font-medium text-gray-900 dark:text-white">
                {{
                  formatTokenAmount(currentApproval, selectedToken.decimals)
                }}
                {{ selectedToken.symbol }}
              </span>
            </div>
          </div>

          <!-- Quick Amount Buttons -->
          <div v-if="selectedToken" class="space-y-2">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Quick amounts:
            </p>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="percentage in [25, 50, 75, 100]"
                :key="percentage"
                size="sm"
                variant="outline"
                @click="setApprovalPercentage(percentage)"
              >
                {{ percentage }}%
              </UButton>
              <UButton size="sm" variant="outline" @click="setMaxApproval">
                Max
              </UButton>
            </div>
          </div>
        </div>

        <!-- Current Approvals -->
        <div v-if="tokenApprovals.length > 0">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Current Approvals
          </h4>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="approval in tokenApprovals"
              :key="approval.canisterId"
              class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
                >
                  <span class="text-sm font-medium">{{
                    getTokenSymbol(approval.canisterId).charAt(0)
                  }}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ getTokenName(approval.canisterId) }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ getTokenSymbol(approval.canisterId) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatTokenAmount(approval.amount, approval.decimals) }}
                  {{ getTokenSymbol(approval.canisterId) }}
                </span>
                <UButton
                  size="sm"
                  color="red"
                  variant="outline"
                  :loading="revokingTokens.has(approval.canisterId)"
                  @click="revokeToken(approval.canisterId)"
                >
                  Revoke
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2"
          />
          <p class="text-gray-600 dark:text-gray-400">
            Loading token approvals...
          </p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="tokenApprovals.length === 0 && !loading"
          class="text-center py-8"
        >
          <UIcon
            name="i-heroicons-currency-dollar"
            class="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Token Approvals
          </h4>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            You haven't approved any tokens for the marketplace yet.
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <UButton variant="outline" @click="closeModal"> Close </UButton>
          <div class="flex space-x-3">
            <UButton
              v-if="selectedToken && approvalAmount"
              :loading="approving"
              :disabled="!isValidApproval"
              @click="approveToken"
            >
              {{ approving ? 'Approving...' : 'Approve Token' }}
            </UButton>
            <UButton
              v-if="tokenApprovals.length > 0"
              color="red"
              variant="outline"
              :loading="revokingAll"
              @click="revokeAllTokens"
            >
              {{ revokingAll ? 'Revoking...' : 'Revoke All' }}
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { useApprovals } from '~/composables/useApprovals'

  interface Token {
    canisterId: string
    name: string
    symbol: string
    decimals: number
  }

  interface _TokenApproval {
    canisterId: string
    amount: bigint
    decimals: number
  }

  interface Props {
    modelValue: boolean
    selectedToken?: Token
  }

  const props = withDefaults(defineProps<Props>(), {
    selectedToken: undefined,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'token-approved': [token: Token, amount: bigint]
    'token-revoked': [canisterId: string]
    'all-revoked': []
  }>()

  // Composables
  const {
    tokenApprovals,
    loadTokenApprovals,
    approveToken: approveTokenComposable,
    revokeToken: revokeTokenComposable,
    loading: _approvalsLoading,
  } = useApprovals()

  // State
  const isOpen = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
  })

  const selectedToken = ref<Token | null>(props.selectedToken || null)
  const approvalAmount = ref('')
  const loading = ref(false)
  const approving = ref(false)
  const revokingTokens = ref(new Set<string>())
  const revokingAll = ref(false)
  const tokenBalance = ref(BigInt(0))

  const availableTokens: Token[] = [
    {
      canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
      name: 'Internet Computer',
      symbol: 'ICP',
      decimals: 8,
    },
    {
      canisterId: 'uzt4z-lp777-77774-qaabq-cai',
      name: 'NFTropoly Token',
      symbol: 'NTP',
      decimals: 8,
    },
  ]

  const currentApproval = computed(() => {
    if (!selectedToken.value) return BigInt(0)

    const approval = tokenApprovals.value.find(
      a => a.canisterId === selectedToken.value!.canisterId
    )
    return approval?.amount || BigInt(0)
  })

  const isValidApproval = computed(() => {
    if (!selectedToken.value || !approvalAmount.value) return false

    const amount = BigInt(
      Math.floor(
        parseFloat(approvalAmount.value) *
          Math.pow(10, selectedToken.value.decimals)
      )
    )
    return amount > BigInt(0) && amount <= tokenBalance.value
  })

  // Watch for changes in selectedToken prop
  watch(
    () => props.selectedToken,
    newToken => {
      if (newToken) {
        selectedToken.value = newToken
      }
    },
    { immediate: true }
  )

  // Load token approvals when modal opens
  watch(isOpen, async open => {
    if (open) {
      await loadTokenApprovals()
      if (selectedToken.value) {
        await loadTokenBalance(selectedToken.value.canisterId)
      }
    }
  })

  // Load token balance when selected token changes
  watch(selectedToken, async newToken => {
    if (newToken) {
      await loadTokenBalance(newToken.canisterId)
    }
  })

  async function loadTokenBalance(_canisterId: string) {
    try {
      // This would typically call a service to get token balance
      // For now, we'll use mock data
      tokenBalance.value = BigInt(1000000000) // 10 tokens with 8 decimals
    } catch (error) {
      console.error('Failed to load token balance:', error)
      tokenBalance.value = BigInt(0)
    }
  }

  function getTokenStep(): string {
    if (!selectedToken.value) return '0.00000001'
    return (1 / Math.pow(10, selectedToken.value.decimals)).toString()
  }

  function formatTokenAmount(amount: bigint, decimals: number): string {
    const divisor = BigInt(Math.pow(10, decimals))
    const wholePart = amount / divisor
    const fractionalPart = amount % divisor

    if (fractionalPart === BigInt(0)) {
      return wholePart.toString()
    }

    const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
    const trimmedFractional = fractionalStr.replace(/0+$/, '')

    if (trimmedFractional === '') {
      return wholePart.toString()
    }

    return `${wholePart}.${trimmedFractional}`
  }

  function getTokenName(canisterId: string): string {
    const token = availableTokens.find(t => t.canisterId === canisterId)
    return token?.name || 'Unknown Token'
  }

  function getTokenSymbol(canisterId: string): string {
    const token = availableTokens.find(t => t.canisterId === canisterId)
    return token?.symbol || 'UNK'
  }

  function setApprovalPercentage(percentage: number) {
    if (!selectedToken.value) return

    const amount = (tokenBalance.value * BigInt(percentage)) / BigInt(100)
    approvalAmount.value = formatTokenAmount(
      amount,
      selectedToken.value.decimals
    )
  }

  function setMaxApproval() {
    if (!selectedToken.value) return

    approvalAmount.value = formatTokenAmount(
      tokenBalance.value,
      selectedToken.value.decimals
    )
  }

  async function approveToken() {
    if (!selectedToken.value || !approvalAmount.value) return

    approving.value = true

    try {
      const amount = BigInt(
        Math.floor(
          parseFloat(approvalAmount.value) *
            Math.pow(10, selectedToken.value.decimals)
        )
      )

      await approveTokenComposable(selectedToken.value.canisterId, amount)

      emit('token-approved', selectedToken.value, amount)

      // Reset form
      approvalAmount.value = ''
    } catch (error) {
      console.error('Failed to approve token:', error)
      // Handle error - could show a toast
    } finally {
      approving.value = false
    }
  }

  async function revokeToken(canisterId: string) {
    revokingTokens.value.add(canisterId)

    try {
      await revokeTokenComposable(canisterId)
      emit('token-revoked', canisterId)
    } catch (error) {
      console.error('Failed to revoke token:', error)
      // Handle error - could show a toast
    } finally {
      revokingTokens.value.delete(canisterId)
    }
  }

  async function revokeAllTokens() {
    revokingAll.value = true

    try {
      for (const approval of tokenApprovals.value) {
        await revokeTokenComposable(approval.canisterId)
      }

      emit('all-revoked')
    } catch (error) {
      console.error('Failed to revoke all tokens:', error)
      // Handle error - could show a toast
    } finally {
      revokingAll.value = false
    }
  }

  function closeModal() {
    isOpen.value = false
    selectedToken.value = null
    approvalAmount.value = ''
    tokenBalance.value = BigInt(0)
  }

  onMounted(() => {
    if (isOpen.value) {
      loadTokenApprovals()
    }
  })
</script>
