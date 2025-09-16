<template>
  <div class="flex items-center space-x-4">
    <div class="flex items-center space-x-2">
      <label class="text-sm font-medium text-gray-700">Sort by:</label>
      <USelect
        :model-value="sortBy"
        :options="sortOptions"
        option-attribute="label"
        value-attribute="value"
        size="sm"
        @update:model-value="$emit('update:sort-by', $event)"
      />
    </div>

    <div class="flex items-center space-x-2">
      <label class="text-sm font-medium text-gray-700">Order:</label>
      <USelect
        :model-value="sortOrder"
        :options="sortOrderOptions"
        option-attribute="label"
        value-attribute="value"
        size="sm"
        @update:model-value="$emit('update:sort-order', $event)"
      />
    </div>

    <UButton
      variant="ghost"
      size="sm"
      :icon="
        sortOrder === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down'
      "
      @click="toggleSortOrder"
    />
  </div>
</template>

<script setup lang="ts">
  interface Props {
    sortBy: 'price' | 'date' | 'popularity'
    sortOrder: 'asc' | 'desc'
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:sort-by': [value: 'price' | 'date' | 'popularity']
    'update:sort-order': [value: 'asc' | 'desc']
  }>()

  // Options
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
  const toggleSortOrder = () => {
    const newOrder = props.sortOrder === 'asc' ? 'desc' : 'asc'
    emit('update:sort-order', newOrder)
  }
</script>
