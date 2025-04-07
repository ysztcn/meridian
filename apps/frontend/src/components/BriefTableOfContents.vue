<template>
  <nav aria-label="Table of contents" ref="tocContainer" class="toc-container">
    <h2 class="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-3">On this page</h2>
    <ul class="space-y-2 border-l border-gray-200 dark:border-gray-700">
      <!-- Loop through structured TOC items -->
      <li v-for="item in structuredItems" :key="item.id" class="ml-0">
        <!-- Section Title (H2/H3) - Using Headless UI Disclosure -->
        <Disclosure
          v-if="item.isSection"
          :defaultOpen="expandedSections[item.id]"
          as="div"
          v-slot="{ open }"
          :key="expandedSections[item.id]"
        >
          <DisclosureButton
            :id="`toc-section-${item.id}`"
            class="flex items-center justify-between w-full text-left text-sm transition-colors duration-150 focus:outline-none py-2 px-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            :class="[
              'hover:text-gray-900 dark:hover:text-gray-100', // Hover state
              item.level === 2 ? 'pl-2' : 'pl-4', // Indentation based on level
              isSectionActive(item)
                ? 'font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50' // Active section style
                : 'text-gray-500 dark:text-gray-400', // Default/Inactive style
            ]"
            @click="toggleSection(item.id)"
          >
            <span class="break-words pr-2">{{ item.text }}</span>
            <!-- Chevron icon for expand/collapse -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="w-4 h-4 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 ease-out flex-shrink-0"
              :class="{ 'rotate-90': open }"
            >
              <path
                fill-rule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clip-rule="evenodd"
              />
            </svg>
          </DisclosureButton>

          <transition name="slide">
            <DisclosurePanel
              class="mt-1 space-y-1 active:border-none active:outline-none border-l border-gray-200 dark:border-gray-700 ml-1 pl-3 overflow-hidden"
            >
              <!-- Indent topics further -->
              <ul>
                <li v-for="topic in item.topics" :key="topic.id" class="ml-0 mb-1">
                  <NuxtLink
                    :id="`toc-item-${topic.id}`"
                    :to="`#${topic.id}`"
                    @click.prevent="$emit('navigate', topic.id)"
                    class="block text-sm hover:underline transition-colors duration-150 break-words py-1 px-1 rounded"
                    :class="[
                      'hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50', // Hover state
                      activeHeadingId === topic.id
                        ? 'font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50' // Active topic style
                        : 'text-gray-500 dark:text-gray-400', // Default/Inactive style
                      'pl-2', // Indentation for topics
                    ]"
                  >
                    {{ topic.text }}
                  </NuxtLink>
                </li>
              </ul>
            </DisclosurePanel>
          </transition>
        </Disclosure>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';

interface TocItemBase {
  id: string;
  text: string;
  level: number; // Original heading level (e.g., 2 for H2, 5 for Topic)
}

interface TocSection extends TocItemBase {
  isSection: true;
  topics: TocTopic[];
}

interface TocTopic extends TocItemBase {
  isSection: false;
}

type StructuredTocItem = TocSection | TocTopic; // Union type for structured items

// Props definition (now expects the structured items)
const props = defineProps<{
  items: TocItemBase[]; // Still receive the flat list initially
  activeHeadingId?: string | null; // Add prop for active heading
}>();

// Emits definition for navigation
const emit = defineEmits<{
  (e: 'navigate', id: string): void;
  (e: 'activeHeadingChange', id: string): void;
}>();

// Refs
const tocContainer = ref<HTMLElement | null>(null);
const isManualScroll = ref(false);

// --- State for Expand/Collapse ---
const expandedSections = ref<Record<string, boolean>>({});
const activeHeadingId = ref<string | null>(props.activeHeadingId || null);

// Function to check if a section is active (either directly or because one of its children is active)
const isSectionActive = (section: TocSection): boolean => {
  if (!activeHeadingId.value) return false;

  // Section itself is active
  if (section.id === activeHeadingId.value) return true;

  // One of section's topics is active
  return section.topics.some(topic => topic.id === activeHeadingId.value);
};

// Function to toggle section open/closed
const toggleSection = (sectionId: string) => {
  expandedSections.value[sectionId] = !expandedSections.value[sectionId];

  // If opening a section, immediately scroll it into view
  if (expandedSections.value[sectionId]) {
    scrollActiveTocItemIntoView(sectionId, true);
  }
};

// Find section containing a heading ID
const findSectionContainingHeading = (headingId: string): TocSection | undefined => {
  return structuredItems.value.find(
    item => item.isSection && (item.id === headingId || item.topics.some(topic => topic.id === headingId))
  ) as TocSection | undefined;
};

// Scroll TOC item into view if needed
const scrollActiveTocItemIntoView = (headingId: string, isImmediate = false) => {
  if (!tocContainer.value || isManualScroll.value) return;

  // Let the section open first (if needed)
  nextTick(() => {
    // First try to find the active topic
    let elementId = `toc-item-${headingId}`;
    let element = document.getElementById(elementId);

    // If not found, it might be a section header
    if (!element) {
      const section = findSectionContainingHeading(headingId);
      if (section) {
        elementId = `toc-section-${section.id}`;
        element = document.getElementById(elementId);
      }
    }

    if (element) {
      // Check if element is outside view
      const container = tocContainer.value;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      const isInView = elementRect.top >= containerRect.top && elementRect.bottom <= containerRect.bottom;

      // Only scroll if element is not in view
      if (!isInView || isImmediate) {
        isManualScroll.value = true; // Prevent observer triggers during programmatic scroll

        // Calculate position to center the element if possible
        const scrollTop =
          element.offsetTop - container.offsetTop - container.clientHeight / 2 + element.clientHeight / 2;

        container.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: isImmediate ? 'auto' : 'smooth',
        });

        // Reset the manual scroll flag after animation completes
        setTimeout(() => {
          isManualScroll.value = false;
        }, 300); // Adjust timing based on your scroll animation duration
      }
    }
  });
};

// Update active heading and open corresponding section
const setActiveHeading = (headingId: string) => {
  if (headingId === activeHeadingId.value) return;

  activeHeadingId.value = headingId;
  emit('activeHeadingChange', headingId);

  const sectionItem = findSectionContainingHeading(headingId);
  if (sectionItem) {
    // Close all sections first
    Object.keys(expandedSections.value).forEach(id => {
      expandedSections.value[id] = false;
    });

    // Then open just the active one
    expandedSections.value[sectionItem.id] = true;

    // Scroll the active item into view
    scrollActiveTocItemIntoView(headingId);
  }
};

// Watch for prop changes to active heading from parent
watch(
  () => props.activeHeadingId,
  newId => {
    if (newId) setActiveHeading(newId);
  },
  { immediate: true }
);

// --- Structure the TOC items ---
const structuredItems = computed((): StructuredTocItem[] => {
  const structured: StructuredTocItem[] = [];
  let currentSection: TocSection | null = null;

  props.items.forEach(item => {
    // Assuming H2/H3 are section headers, and level 5+ are topics
    if (item.level <= 3) {
      // Adjust level threshold if needed (e.g., <= 4 for H4 sections)
      currentSection = { ...item, isSection: true, topics: [] };
      structured.push(currentSection);
      // Initialize expanded state (default to collapsed)
      if (expandedSections.value[item.id] === undefined) {
        expandedSections.value[item.id] = false;
      }
    } else if (currentSection) {
      // If it's a topic (level > 3) and we have a current section, add it
      currentSection.topics.push({ ...item, isSection: false });
    }
    // Ignore topics that don't appear under a section header (optional)
  });

  return structured;
});

// --- Active Heading Highlighting based on scroll position ---
let observer: IntersectionObserver | null = null;
const observedElements = ref<Map<string, HTMLElement>>(new Map());

const observerCallback: IntersectionObserverCallback = entries => {
  if (isManualScroll.value) return; // Skip if currently programmatically scrolling

  // Find the entry highest up in the viewport that is intersecting
  let topIntersectingEntry: IntersectionObserverEntry | null = null;
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (!topIntersectingEntry || entry.boundingClientRect.top < topIntersectingEntry.boundingClientRect.top) {
        topIntersectingEntry = entry;
      }
    }
  });

  if (topIntersectingEntry) {
    const newActiveId = topIntersectingEntry.target.id;
    setActiveHeading(newActiveId);
  }
};

onMounted(() => {
  // Setup the observer on mount to ensure DOM is ready
  setTimeout(setupObserver, 200); // Short delay to ensure DOM is ready
});

const setupObserver = () => {
  if (!('IntersectionObserver' in window)) return;

  observer?.disconnect(); // Disconnect previous observer if any
  observedElements.value.clear();

  observer = new IntersectionObserver(observerCallback, {
    rootMargin: '0px 0px -70% 0px', // Trigger when heading is in top 30% of viewport
    threshold: 0,
  });

  // Find and observe all headings in the document
  structuredItems.value.forEach(item => {
    if (item.isSection) {
      const el = document.getElementById(item.id);
      if (el) {
        observer?.observe(el);
        observedElements.value.set(item.id, el);
      }

      item.topics.forEach(topic => {
        const topicEl = document.getElementById(topic.id);
        if (topicEl) {
          observer?.observe(topicEl);
          observedElements.value.set(topic.id, topicEl);
        }
      });
    }
  });
};

// Watch for changes in items to re-setup the observer
watch(
  () => props.items,
  () => {
    // Need a small delay to ensure all DOM elements are available
    setTimeout(setupObserver, 200);
  },
  { immediate: true, deep: true }
);

// Clean up observer on component unmount
onUnmounted(() => {
  observer?.disconnect();
});
</script>

<style scoped>
/* TOC container with overflow support */
.toc-container {
  max-height: 70vh;
  overflow-y: auto;
  scrollbar-width: thin;
  position: relative;
}

/* Subtle scrollbar styling for WebKit browsers */
.toc-container::-webkit-scrollbar {
  width: 5px;
}

.toc-container::-webkit-scrollbar-track {
  background: transparent;
}

.toc-container::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

.dark .toc-container::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

/* Headless UI focus styles handled via classes */
.disclosure-btn:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Smooth height transition for accordion */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  max-height: 300px;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Add subtle dividers between sections */
li + li {
  border-top: 1px solid rgba(229, 231, 235, 0.3);
}
.dark li + li {
  border-top: 1px solid rgba(55, 65, 81, 0.3);
}
</style>
