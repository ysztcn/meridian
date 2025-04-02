<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
import { Cog6ToothIcon } from '@heroicons/vue/20/solid';
</script>

<!-- class="h-5 w-5 text-zinc-700 dark:text-zinc-300" -->

<template>
  <Menu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton class="hover:cursor-pointer">
        <Cog6ToothIcon
          class="pt-0.5 w-5 h-5 dark:text-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-600"
          aria-hidden="true"
        />
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 focus:outline-none"
      >
        <div class="px-1 py-1">
          <MenuItem v-slot="{ active }" v-for="theme of ['system', 'light', 'dark']" :key="theme">
            <button
              @click="$colorMode.preference = theme"
              :class="[
                active ? 'bg-violet-500 text-white' : 'text-gray-900 dark:text-gray-100',
                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
              ]"
            >
              {{ theme }}
              <!-- <EditIcon :active="active" class="mr-2 h-5 w-5 text-violet-400" aria-hidden="true" /> -->
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>
