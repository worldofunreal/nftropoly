<template>
  <div class="bg-white rounded-lg shadow-sm border">
    <div class="p-6 border-b">
      <h3 class="text-lg font-semibold text-gray-900">Escrow Records</h3>
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
              Amount
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="record in records" :key="record.ask_id.toString()">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ record.ask_id.toString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ getEscrowType(record) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ getEscrowAmount(record) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <UButton
                @click="$emit('withdraw', record)"
                color="blue"
                variant="outline"
                size="sm"
                :loading="loading"
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
import { getEscrowType, getEscrowTokens, formatTokenAmount } from '~/utils/marketplace'

interface Props {
  records: EscrowRecord[]
  loading?: boolean
}

defineProps<Props>()
defineEmits<{
  withdraw: [record: EscrowRecord]
}>()

const getEscrowAmount = (record: EscrowRecord) => {
  const tokens = getEscrowTokens(record)
  if (tokens.length > 0) {
    return formatTokenAmount(tokens[0].standards[0]?.ICRC1?.[0]?.amount || BigInt(0), 8)
  }
  return 'N/A'
}
</script>
