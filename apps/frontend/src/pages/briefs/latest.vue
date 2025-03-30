<script setup lang="ts">
const reports = useReports();

// redirect to the latest report
const latestReport = reports.value[0];
if (latestReport) {
  await navigateTo(`/briefs/${latestReport.slug}`);
} else {
  throw createError({
    statusCode: 404,
    statusMessage: 'No reports found',
  });
}

useSeoMeta({
  title: 'latest report | meridian',
  description: 'my personal intelligence agency',
  ogTitle: 'latest report | meridian',
  ogDescription: 'my personal intelligence agency',
});
</script>

<template>
  <div>
    <p>Redirecting to the latest report...</p>
  </div>
</template>
