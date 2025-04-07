<template>
  <div class="min-h-screen flex flex-col">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
/* Smooth scrolling for html */
html {
  scroll-behavior: smooth;
}

:root {
  --color: #243746;
  --color-primary: #243746;
  --color-secondary: #0e2233;
  --bg: #f3f5f4;
  --bg-secondary: #fff;
  --border-color: #ddd;
}

.dark {
  --color: #f7fafc;
  --color-primary: #e2e8f0;
  --color-secondary: #a0aec0;
  --bg: #1a202c;
  --bg-secondary: #2d3748;
  --border-color: #4a5568;
}

body {
  background-color: var(--bg);
  color: var(--color);
  transition:
    background-color 0.3s,
    color 0.3s;
}

a {
  color: var(--color-primary);
}

a:hover {
  opacity: 0.8;
}

.dark {
  color-scheme: dark;
}

/* Prose styles customized for each theme */
.prose {
  color: var(--color);
  max-width: 100%;
  line-height: 1.8;
}

.prose a {
  color: var(--color-primary);
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

.prose strong {
  color: var(--color-primary);
  font-weight: 700;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4 {
  color: var(--color);
}

.prose blockquote {
  color: var(--color-secondary);
}

.prose code {
  color: var(--color-secondary);
  background-color: var(--bg-secondary);
}

.prose pre {
  color: var(--color);
  background-color: var(--bg-secondary);
}

.prose hr {
  border-color: var(--border-color);
}
</style>
