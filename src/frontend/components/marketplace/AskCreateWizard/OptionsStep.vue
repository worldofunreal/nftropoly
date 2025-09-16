<template>
  <div class="options-step">
    <div class="step-header mb-6">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
        Configure Options
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        Set additional options for your listing (optional)
      </p>
    </div>

    <div class="space-y-8">
      <!-- Expiration -->
      <div class="expiration-section">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Expiration
        </h4>
        <UCheckbox
          v-model="enableExpiration"
          label="Set expiration date"
          class="mb-4"
        />
        <UInput
          v-if="enableExpiration"
          :model-value="modelValue.expiresAt"
          type="datetime-local"
          label="Expires at"
          :min="minDate"
          @update:model-value="updateExpiresAt"
        />
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Your listing will automatically end at this time
        </p>
      </div>

      <!-- Description -->
      <div class="description-section">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Description
        </h4>
        <UTextarea
          :model-value="modelValue.description"
          placeholder="Describe your NFT listing..."
          :rows="4"
          :maxlength="1000"
          @update:model-value="updateDescription"
        />
        <div class="flex justify-between text-sm text-gray-500 mt-1">
          <span>Optional</span>
          <span>{{ modelValue.description.length }}/1000</span>
        </div>
      </div>

      <!-- Tags -->
      <div class="tags-section">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Tags
        </h4>
        <div class="space-y-4">
          <UInput
            v-model="newTag"
            placeholder="Add a tag..."
            @keyup.enter="addTag"
          >
            <template #trailing>
              <UButton
                icon="i-heroicons-plus"
                size="sm"
                variant="ghost"
                :disabled="!newTag.trim()"
                @click="addTag"
              />
            </template>
          </UInput>

          <div v-if="modelValue.tags.length > 0" class="flex flex-wrap gap-2">
            <UBadge
              v-for="(tag, index) in modelValue.tags"
              :key="index"
              color="primary"
              variant="soft"
              class="cursor-pointer"
              @click="removeTag(index)"
            >
              {{ tag }}
              <UIcon name="i-heroicons-x-mark" class="ml-1 text-xs" />
            </UBadge>
          </div>

          <div v-else class="text-sm text-gray-500">No tags added yet</div>
        </div>
      </div>

      <!-- Advanced Options -->
      <div class="advanced-section">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Advanced Options
        </h4>

        <div class="space-y-4">
          <UCheckbox
            v-model="enableNotifications"
            label="Enable notifications for bids and offers"
          />

          <UCheckbox
            v-model="enableAutoAccept"
            label="Auto-accept offers at or above reserve price"
          />

          <UCheckbox
            v-model="enablePrivateListing"
            label="Private listing (only visible to you until published)"
          />
        </div>
      </div>

      <!-- Preview -->
      <div class="preview-section">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Listing Preview
        </h4>

        <div
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
        >
          <div class="flex items-start space-x-4">
            <div
              class="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center"
            >
              <UIcon name="i-heroicons-photo" class="text-2xl text-gray-500" />
            </div>

            <div class="flex-1">
              <h5 class="font-semibold text-gray-900 dark:text-white">
                {{ selectedNFTsCount }} NFT{{
                  selectedNFTsCount !== 1 ? 's' : ''
                }}
              </h5>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {{ askTypeLabel }}
              </p>
              <p
                v-if="modelValue.description"
                class="text-sm text-gray-700 dark:text-gray-300"
              >
                {{ modelValue.description }}
              </p>
              <div
                v-if="modelValue.tags.length > 0"
                class="flex flex-wrap gap-1 mt-2"
              >
                <UBadge
                  v-for="tag in modelValue.tags"
                  :key="tag"
                  size="xs"
                  color="gray"
                  variant="soft"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step Actions -->
    <div class="step-actions flex justify-between mt-8">
      <UButton variant="outline" @click="$emit('prev')">
        <UIcon name="i-heroicons-arrow-left" class="mr-2" />
        Back
      </UButton>
      <UButton @click="$emit('next')">
        Continue
        <UIcon name="i-heroicons-arrow-right" class="ml-2" />
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'

  interface Props {
    modelValue: {
      selectedNFTs: Array<{
        canisterId: string
        tokenId: bigint
        metadata: unknown
      }>
      askType: 'buynow' | 'auction' | 'dutch' | 'amm'
      expiresAt?: string
      description: string
      tags: string[]
    }
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:modelValue': [value: Props['modelValue']]
    next: []
    prev: []
  }>()

  // State
  const enableExpiration = ref(false)
  const enableNotifications = ref(true)
  const enableAutoAccept = ref(false)
  const enablePrivateListing = ref(false)
  const newTag = ref('')

  const selectedNFTsCount = computed(() => props.modelValue.selectedNFTs.length)

  const askTypeLabel = computed(() => {
    const labels = {
      buynow: 'Buy Now',
      auction: 'Auction',
      dutch: 'Dutch Auction',
      amm: 'AMM',
    }
    return labels[props.modelValue.askType]
  })

  const minDate = computed(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30) // At least 30 minutes from now
    return now.toISOString().slice(0, 16)
  })

  function addTag() {
    const tag = newTag.value.trim()
    if (tag && !props.modelValue.tags.includes(tag)) {
      emit('update:modelValue', {
        ...props.modelValue,
        tags: [...props.modelValue.tags, tag],
      })
      newTag.value = ''
    }
  }

  function updateExpiresAt(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      expiresAt: value,
    })
  }

  function updateDescription(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      description: value,
    })
  }

  function removeTag(index: number) {
    const tags = [...props.modelValue.tags]
    tags.splice(index, 1)
    emit('update:modelValue', {
      ...props.modelValue,
      tags,
    })
  }

  // Watch for expiration checkbox changes
  watch(enableExpiration, enabled => {
    if (!enabled) {
      emit('update:modelValue', {
        ...props.modelValue,
        expiresAt: undefined,
      })
    } else if (!props.modelValue.expiresAt) {
      // Set default expiration to 7 days from now
      const defaultExpiration = new Date()
      defaultExpiration.setDate(defaultExpiration.getDate() + 7)
      emit('update:modelValue', {
        ...props.modelValue,
        expiresAt: defaultExpiration.toISOString().slice(0, 16),
      })
    }
  })
</script>

<style scoped>
  .options-step {
    @apply max-w-2xl mx-auto;
  }
</style>
