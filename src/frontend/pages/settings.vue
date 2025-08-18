<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account preferences and security settings
        </p>
      </div>

      <!-- Settings Tabs -->
      <div class="bg-white dark:bg-neutral-800 rounded-lg shadow">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8 px-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="[
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              ]"
              @click="activeTab = tab.id"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Profile Settings -->
          <div v-if="activeTab === 'profile'" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Profile Information
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update your personal information and profile picture
              </p>
            </div>

            <div class="flex items-center space-x-6">
              <div class="flex-shrink-0">
                <img
                  class="h-16 w-16 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Profile"
                >
              </div>
              <div>
                <button
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Change Photo
                </button>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  JPG, GIF or PNG. 1MB max.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >First Name</label
                >
                <input
                  v-model="profile.firstName"
                  type="text"
                  class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-neutral-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Last Name</label
                >
                <input
                  v-model="profile.lastName"
                  type="text"
                  class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-neutral-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div class="sm:col-span-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Email</label
                >
                <input
                  v-model="profile.email"
                  type="email"
                  class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-neutral-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div class="sm:col-span-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Bio</label
                >
                <textarea
                  v-model="profile.bio"
                  rows="3"
                  class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-neutral-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Security Settings -->
          <div v-if="activeTab === 'security'" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Security Settings
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your password and security preferences
              </p>
            </div>

            <div class="space-y-4">
              <div
                class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
              >
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                    Two-Factor Authentication
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Enable
                </button>
              </div>

              <div
                class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
              >
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                    Login Notifications
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Get notified when someone logs into your account
                  </p>
                </div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    checked
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  >
                </div>
              </div>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4
                class="text-sm font-medium text-gray-900 dark:text-white mb-4"
              >
                Change Password
              </h4>
              <div class="space-y-4">
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Current Password</label
                  >
                  <input
                    type="password"
                    class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-neutral-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >New Password</label
                  >
                  <input
                    type="password"
                    class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-neutral-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Confirm New Password</label
                  >
                  <input
                    type="password"
                    class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-neutral-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Notifications Settings -->
          <div v-if="activeTab === 'notifications'" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Notification Preferences
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose how you want to be notified about activity
              </p>
            </div>

            <div class="space-y-4">
              <div
                class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
              >
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Receive updates via email
                  </p>
                </div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    checked
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  >
                </div>
              </div>

              <div
                class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
              >
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                    Push Notifications
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Receive push notifications in your browser
                  </p>
                </div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    checked
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  >
                </div>
              </div>

              <div
                class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
              >
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                    NFT Sales
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Get notified when your NFTs are sold
                  </p>
                </div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    checked
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  >
                </div>
              </div>

              <div
                class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
              >
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                    Price Alerts
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Get notified about price changes for your watchlist
                  </p>
                </div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="px-6 py-4 bg-neutral-50 dark:bg-neutral-700 rounded-b-lg">
          <div class="flex justify-end">
            <button
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const activeTab = ref('profile')

  const tabs = [
    { id: 'profile', name: 'Profile' },
    { id: 'security', name: 'Security' },
    { id: 'notifications', name: 'Notifications' },
  ]

  const profile = ref({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    bio: 'NFT enthusiast and digital art collector. Passionate about the future of digital ownership and blockchain technology.',
  })
</script>
