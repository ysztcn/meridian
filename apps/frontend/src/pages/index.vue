<script setup lang="ts">
const { $md } = useNuxtApp();

const text = ref(
  `
## what is this?

my personal intelligence agency. i built a daily brief of everything important happening that i care about, with *actual analysis* beyond headlines.

gives me the "what", "why", and "so what" behind global events in 15min.

### how it works
- scrapes hundreds of news sources
- clusters related articles
- separates facts from disputed claims
- spots bias patterns
- runs targeted web searches to find context and fill knowledge gaps
- identifies what actually matters
- delivers one clean & engaging brief

### why i built this

always thought it was cool how presidents get those daily briefings - everything they need to know, perfectly prepared by a team of analysts. figured *why can't i have that too*?

now with ai, i can. what would've required an *entire* intelligence agency now costs about *a dollar a day* in compute.

this brief is tuned to what i care about (geopolitics, french news, tech, actual good news).

just what's happening and why it matters. no middleman deciding what reaches me.
`.trim()
);

useSeoMeta({
  title: 'home | meridian',
  description: 'my personal intelligence agency',
  ogTitle: 'home | meridian',
  ogDescription: 'my personal intelligence agency',
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="prose" v-html="$md.render(text)" />
  </div>
</template>
