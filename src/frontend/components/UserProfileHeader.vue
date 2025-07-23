<template>
  <div class="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-2xl shadow-lg overflow-hidden mb-8">
    <!-- Background Banner (blurred) -->
    <div class="absolute inset-0 z-0">
      <img src="https://placehold.co/1200x240" alt="Banner" class="w-full h-48 object-cover blur-sm opacity-60" />
    </div>
    <div class="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 px-8 py-8">
      <!-- Avatar & Wallet Info -->
      <div class="flex items-center gap-6 flex-1 min-w-0">
        <img src="https://placehold.co/96x96" alt="Avatar" class="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-900 shadow-lg bg-white" />
        <div class="flex flex-col gap-2 min-w-0">
          <div class="flex items-center gap-2 text-xl font-bold text-white truncate">
            0x5737...b4e4
            <UIcon name="i-heroicons-document-duplicate-20-solid" class="text-white cursor-pointer" />
            <a href="#" target="_blank"><UIcon name="i-heroicons-arrow-top-right-on-square-20-solid" class="text-white" /></a>
            <span class="ml-2 bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded-full">3xp</span>
          </div>
        </div>
      </div>
      <!-- Stats Block (Top Right, vertically stacked) -->
      <div class="hidden md:flex flex-col items-end gap-x-8 gap-y-2 ml-auto">
        <div class="flex flex-col items-end gap-1">
          <span class="uppercase text-xs text-gray-200 font-light flex items-center gap-1">Portfolio Value <UIcon name="i-heroicons-eye-20-solid" class="text-gray-200 text-xs" /></span>
          <span class="text-base font-semibold text-white">0.00 ETH</span>
        </div>
        <div class="flex flex-col items-end gap-1">
          <span class="uppercase text-xs text-gray-200 font-light">USD Value</span>
          <span class="text-base font-semibold text-white">$0.00</span>
        </div>
        <div class="flex flex-col items-end gap-1">
          <span class="uppercase text-xs text-gray-200 font-light">NFTs</span>
          <span class="text-base font-semibold text-white">0%</span>
        </div>
        <div class="flex flex-col items-end gap-1">
          <span class="uppercase text-xs text-gray-200 font-light">Tokens</span>
          <span class="text-base font-semibold text-white">0%</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts"></script> 