<template>
  <NuxtLink
    :to="`/tags/${slug}`"
    class="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors"
  >
    {{ name }}
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ name: string; slug: string }>();
</script>
