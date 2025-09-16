<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

    <div class="space-y-6">
      <!-- Status Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Status</label
        >
        <div class="space-y-2">
          <label
            v-for="status in statusOptions"
            :key="status.value"
            class="flex items-center"
          >
            <input
              v-model="localFilters.status"
              :value="status.value"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span class="ml-2 text-sm text-gray-700">{{ status.label }}</span>
          </label>
        </div>
      </div>

      <!-- Price Range -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Price Range (NTRP)</label
        >
        <div class="grid grid-cols-2 gap-2">
          <UInput
            v-model="localFilters.priceRange.min"
            placeholder="Min"
            type="number"
            step="0.01"
          />
          <UInput
            v-model="localFilters.priceRange.max"
            placeholder="Max"
            type="number"
            step="0.01"
          />
        </div>
      </div>

      <!-- Token Types -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Token Types</label
        >
        <div class="space-y-2">
          <label
            v-for="tokenType in tokenTypeOptions"
            :key="tokenType.value"
            class="flex items-center"
          >
            <input
              v-model="localFilters.tokenTypes"
              :value="tokenType.value"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span class="ml-2 text-sm text-gray-700">{{
              tokenType.label
            }}</span>
          </label>
        </div>
      </div>

      <!-- Sort By -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Sort By</label
        >
        <USelect
          v-model="localFilters.sortBy"
          :options="sortOptions"
          option-attribute="label"
          value-attribute="value"
        />
      </div>

      <!-- Sort Order -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Sort Order</label
        >
        <USelect
          v-model="localFilters.sortOrder"
          :options="sortOrderOptions"
          option-attribute="label"
          value-attribute="value"
        />
      </div>

      <!-- Actions -->
      <div class="flex space-x-2">
        <UButton color="blue" size="sm" block @click="applyFilters">
          Apply Filters
        </UButton>
        <UButton variant="outline" size="sm" block @click="resetFilters">
          Reset
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'

  interface Filters {
    status: string[]
    priceRange: { min: string; max: string }
    tokenTypes: string[]
    sortBy: 'price' | 'date' | 'popularity'
    sortOrder: 'asc' | 'desc'
  }

  interface Props {
    filters: Filters
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:filters': [filters: Filters]
  }>()

  // Local state
  const localFilters = ref<Filters>({ ...props.filters })

  // Options
  const statusOptions = [
    { value: 'Open', label: 'Open' },
    { value: 'Closed', label: 'Closed' },
    { value: 'PartiallySettled', label: 'Partially Settled' },
    { value: 'NotStarted', label: 'Not Started' },
    { value: 'Encumbered', label: 'Encumbered' },
  ]

  const tokenTypeOptions = [
    { value: 'ICRC37', label: 'ICRC-37 NFTs' },
    { value: 'ICRC1', label: 'ICRC-1 Tokens' },
  ]

  const sortOptions = [
    { value: 'price', label: 'Price' },
    { value: 'date', label: 'Date' },
    { value: 'popularity', label: 'Popularity' },
  ]

  const sortOrderOptions = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
  ]

  // Methods
  const applyFilters = () => {
    emit('update:filters', { ...localFilters.value })
  }

  const resetFilters = () => {
    localFilters.value = {
      status: ['Open'],
      priceRange: { min: '', max: '' },
      tokenTypes: [],
      sortBy: 'date',
      sortOrder: 'desc',
    }
    applyFilters()
  }

  // Watch for prop changes
  watch(
    () => props.filters,
    newFilters => {
      localFilters.value = { ...newFilters }
    },
    { deep: true }
  )
</script>
