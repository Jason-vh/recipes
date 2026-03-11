<template>
  <div>
    <div v-if="status === 'pending'" class="text-center py-12 text-gray-400">
      Loading recipes...
    </div>
    <div v-else-if="!recipes?.length" class="text-center py-12 text-gray-400">
      No recipes found.
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <RecipeCard v-for="recipe in recipes" :key="recipe.id" :recipe="recipe" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: recipes, status } = useFetch("/api/recipes");
</script>
