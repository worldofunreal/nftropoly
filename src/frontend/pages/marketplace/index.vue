<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Marketplace</h1>
            <p class="mt-2 text-gray-600">
              Discover and trade NFTs on the NFTropoly marketplace
            </p>
          </div>
          <div class="flex space-x-4">
            <UButton
              v-if="isAuthenticated"
              to="/marketplace/create"
              icon="i-heroicons-plus"
              size="lg"
            >
              Create Listing
            </UButton>
            <UButton
              v-else
              icon="i-heroicons-user"
              variant="outline"
              size="lg"
              @click="login"
            >
              Connect Wallet
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Filters Sidebar -->
        <div class="lg:w-80 flex-shrink-0">
          <ListingFilters
            v-model:filters="filters"
            @update:filters="handleFiltersUpdate"
          />
        </div>

        <!-- Main Content -->
        <div class="flex-1">
          <!-- Sort and View Options -->
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">
                {{ pagination.pageInfo.total }} listings found
              </span>
            </div>
            <ListingSort
              v-model:sort-by="filters.sortBy"
              v-model:sort-order="filters.sortOrder"
              @update:sort-by="handleSortUpdate"
              @update:sort-order="handleSortUpdate"
            />
          </div>

          <!-- Loading State -->
          <div v-if="activeAsksLoading" class="space-y-4">
            <div
              v-for="i in 6"
              :key="i"
              class="bg-white rounded-lg shadow-sm border p-6 animate-pulse"
            >
              <div class="flex space-x-4">
                <div class="w-24 h-24 bg-gray-200 rounded-lg" />
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4" />
                  <div class="h-3 bg-gray-200 rounded w-1/2" />
                  <div class="h-3 bg-gray-200 rounded w-1/4" />
                </div>
                <div class="w-32 space-y-2">
                  <div class="h-4 bg-gray-200 rounded" />
                  <div class="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="activeAsksError" class="text-center py-12">
            <div class="text-red-600 mb-4">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-12 h-12 mx-auto"
              />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Failed to load listings
            </h3>
            <p class="text-gray-600 mb-4">{{ activeAsksError }}</p>
            <UButton variant="outline" @click="loadActiveAsks">
              Try Again
            </UButton>
          </div>

          <!-- Empty State -->
          <div v-else-if="activeAsks.length === 0" class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <UIcon name="i-heroicons-cube" class="w-12 h-12 mx-auto" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              No listings found
            </h3>
            <p class="text-gray-600 mb-4">
              Try adjusting your filters or check back later for new listings.
            </p>
            <UButton
              v-if="isAuthenticated"
              to="/marketplace/create"
              icon="i-heroicons-plus"
            >
              Create First Listing
            </UButton>
          </div>

          <!-- Listings Grid -->
          <div v-else>
            <ListingGrid
              :asks="paginatedAsks"
              :loading="activeAsksLoading"
              @ask-click="handleAskClick"
            />

            <!-- Pagination -->
            <div v-if="pagination.totalPages > 1" class="mt-8">
              <UPagination
                v-model="pagination.page"
                :page-count="pagination.pageSize"
                :total="pagination.total"
                :ui="{
                  wrapper: 'flex items-center gap-1',
                  rounded: '!rounded-full min-w-[32px] justify-center',
                  default: {
                    size: 'sm',
                    activeButton: {
                      variant: 'outline',
                    },
                  },
                }"
                @update:model-value="handlePageChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useMarketplace } from '~/composables/useMarketplace'
  import { useAskPagination } from '~/composables/usePagination'
  // import { useAuthStore } from '~/stores/auth'
  import type { AskStatus } from '../../declarations/marketplace/marketplace.did'
  import ListingFilters from '~/components/marketplace/ListingFilters.vue'
  import ListingSort from '~/components/marketplace/ListingSort.vue'
  import ListingGrid from '~/components/marketplace/ListingGrid.vue'

  // Meta
  definePageMeta({
    title: 'Marketplace',
    description: 'Discover and trade NFTs on the NFTropoly marketplace',
  })

  // Composables
  const router = useRouter()
  const marketplace = useMarketplace()
  const pagination = useAskPagination({ pageSize: 20 })
  // const authStore = useAuthStore()

  // State
  const filters = ref({
    status: ['Open'],
    priceRange: { min: '', max: '' },
    tokenTypes: [],
    sortBy: 'date' as 'price' | 'date' | 'popularity',
    sortOrder: 'desc' as 'asc' | 'desc',
  })

  // Computed
  const isAuthenticated = computed(() => marketplace.isAuthenticated.value)
  const activeAsks = computed(() => marketplace.activeAsks.value)
  const activeAsksLoading = computed(() => marketplace.activeAsksLoading.value)
  const activeAsksError = computed(() => marketplace.activeAsksError.value)

  const paginatedAsks = computed(() => {
    const start =
      (pagination.state.value.page - 1) * pagination.state.value.pageSize
    const end = start + pagination.state.value.pageSize
    return activeAsks.value.slice(start, end)
  })

  // Methods
  const loadActiveAsks = async () => {
    try {
      await marketplace.loadActiveAsks()
    } catch (error) {
      console.error('Failed to load active asks:', error)
    }
  }

  const handleFiltersUpdate = (newFilters: unknown) => {
    filters.value = { ...filters.value, ...newFilters }
    marketplace.updateFilters(filters.value)
    pagination.firstPage()
  }

  const handleSortUpdate = () => {
    marketplace.updateFilters(filters.value)
  }

  const handlePageChange = (page: number) => {
    pagination.setPage(page)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAskClick = (ask: AskStatus) => {
    router.push(`/marketplace/${ask.ask_id.toString()}`)
  }

  const login = () => {
    // This would trigger wallet connection
    console.log('Login requested')
  }

  // Lifecycle
  onMounted(async () => {
    if (isAuthenticated.value) {
      await loadActiveAsks()
    }
  })

  // Watch for authentication changes
  watch(isAuthenticated, authenticated => {
    if (authenticated) {
      loadActiveAsks()
    }
  })
</script>
