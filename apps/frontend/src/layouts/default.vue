<script lang="ts" setup>
import { SunIcon, MoonIcon } from '@heroicons/vue/20/solid';

const { data: reports, error: reportsError } = await useLazyAsyncData(async () => fetchReports());
if (reportsError.value) {
  console.error('Failed to fetch articles', reportsError.value);
  throw createError({
    statusCode: 500,
    statusMessage: 'Failed to fetch articles',
  });
}

useReports().value = reports.value || [];
</script>

<template>
  <div>
    <div class="max-w-3xl mx-auto px-6 w-full flex-1">
      <nav class="py-4">
        <ul class="flex space-x-4 items-center font-medium">
          <div class="flex w-full flex-row gap-4">
            <li>
              <NuxtLink class="hover:underline" :class="$route.path === '/' ? 'underline' : ''" to="/"> home </NuxtLink>
            </li>
            <li>
              <NuxtLink class="hover:underline" :class="$route.path === '/briefs' ? 'underline' : ''" to="/briefs">
                briefs
              </NuxtLink>
            </li>
          </div>
          <button
            class="hover:cursor-pointer"
            v-if="$colorMode.value === 'dark'"
            @click="$colorMode.preference = 'light'"
          >
            <SunIcon class="w-5 h-5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-600" />
          </button>
          <button
            class="hover:cursor-pointer"
            v-if="$colorMode.value === 'light'"
            @click="$colorMode.preference = 'dark'"
          >
            <MoonIcon class="w-5 h-5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-600" />
          </button>
        </ul>
      </nav>
      <div class="h-px w-full bg-gray-300 mb-4" />
      <NuxtPage />
    </div>
    <footer>
      <div class="max-w-3xl mx-auto px-6 py-4">
        <div class="h-px w-full bg-gray-300 mb-4" />
        <p class="text-sm text-center">
          built by
          <strong class="underline"><NuxtLink :to="`https://iliane.xyz`">iliane</NuxtLink></strong>
          ·
          <span
            >open source on
            <strong class="underline"
              ><NuxtLink to="https://github.com/iliane5/meridian" target="_blank">github</NuxtLink></strong
            ></span
          >
        </p>
      </div>
    </footer>
  </div>
</template>
