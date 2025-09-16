<template>
  <div class="bg-white rounded-lg shadow-sm border">
    <div class="p-6 border-b">
      <h3 class="text-lg font-semibold text-gray-900">Settlement Records</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Ask ID
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Buyer
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Amount
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="record in records" :key="record.ask_id.toString()">
            <td
              class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
            >
              {{ record.ask_id.toString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{
                record.buyer?.[0]
                  ? formatPrincipal(record.buyer[0].owner.toString())
                  : 'N/A'
              }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ getSettlementAmount(record) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <UButton
                color="green"
                variant="outline"
                size="sm"
                :loading="loading"
                @click="$emit('withdraw', record)"
              >
                Withdraw
              </UButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { EscrowRecord } from '../../declarations/marketplace/marketplace.did'
  import { getEscrowTokens, formatTokenAmount } from '~/utils/marketplace'

  interface Props {
    records: EscrowRecord[]
    loading?: boolean
  }

  defineProps<Props>()
  defineEmits<{
    withdraw: [record: EscrowRecord]
  }>()

  const getSettlementAmount = (record: EscrowRecord) => {
    const tokens = getEscrowTokens(record)
    if (tokens.length > 0) {
      return formatTokenAmount(
        tokens[0].standards[0]?.ICRC1?.[0]?.amount || BigInt(0),
        8
      )
    }
    return 'N/A'
  }

  const formatPrincipal = (principal: string) => {
    return `${principal.slice(0, 6)}...${principal.slice(-4)}`
  }
</script>
