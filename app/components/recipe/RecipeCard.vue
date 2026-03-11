<template>
  <NuxtLink
    :to="`/recipes/${recipe.id}`"
    class="block bg-parchment rounded-xl p-5 transition-colors hover:bg-terra-light active:bg-terra-light"
  >
    <h3 class="font-serif text-lg text-warm-brown leading-snug line-clamp-2">
      {{ recipe.title }}
    </h3>
    <p v-if="recipe.description" class="text-sm text-muted mt-1.5 line-clamp-2">
      {{ recipe.description }}
    </p>
    <div class="flex items-center gap-3 mt-2.5 text-xs text-muted">
      <span v-if="recipe.totalTime">{{ recipe.totalTime }} min</span>
      <span v-if="recipe.servings">{{ recipe.servings }} servings</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  recipe: {
    id: number;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    totalTime?: number | null;
    servings?: string | null;
  };
}>();
</script>
