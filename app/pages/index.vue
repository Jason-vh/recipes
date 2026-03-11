<template>
  <div>
    <h1 class="font-serif text-3xl text-warm-brown mb-8">Recipes</h1>
    <div v-if="status === 'pending'" class="text-center py-12 text-muted">Loading recipes...</div>
    <div v-else-if="!recipes?.length" class="text-center py-12 text-muted">No recipes found.</div>
    <div v-else class="space-y-3">
      <RecipeCard v-for="recipe in recipes" :key="recipe.id" :recipe="recipe" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: recipes, status } = useFetch("/api/recipes");
</script>
