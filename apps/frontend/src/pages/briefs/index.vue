<script setup lang="ts">
const reports = useReports();

useSeoMeta({
  title: 'briefs | meridian',
  description: 'my personal intelligence agency',
  ogTitle: 'briefs | meridian',
  ogDescription: 'my personal intelligence agency',
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <NuxtLink v-for="report in reports" :key="report.id" class="group" :to="`/briefs/${report.slug}`">
      <p class="text-xl font-bold group-hover:underline">{{ report.title.toLowerCase() }}</p>
      <p class="text-sm text-gray-600 mt-1">
        {{ report.date?.month.toLowerCase() }} {{ report.date?.day }}, {{ report.date?.year }}
      </p>
    </NuxtLink>
  </div>
</template>
