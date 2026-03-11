<template>
  <NuxtLink
    :to="`/recipes/${recipe.id}`"
    class="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
  >
    <div v-if="recipe.imageUrl" class="aspect-video bg-gray-100">
      <img :src="recipe.imageUrl" :alt="recipe.title" class="w-full h-full object-cover" />
    </div>
    <div class="p-4">
      <h3 class="font-semibold text-gray-900 line-clamp-2">
        {{ recipe.title }}
      </h3>
      <p v-if="recipe.description" class="text-sm text-gray-500 mt-1 line-clamp-2">
        {{ recipe.description }}
      </p>
      <div class="flex items-center gap-3 mt-3 text-xs text-gray-400">
        <span v-if="recipe.totalTime">{{ recipe.totalTime }} min</span>
        <span v-if="recipe.servings">{{ recipe.servings }} servings</span>
      </div>
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
