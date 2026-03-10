<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/" class="text-gray-400 hover:text-gray-600">
        &larr; All recipes
      </NuxtLink>
      <h1 class="text-lg font-semibold text-gray-900">
        Tagged: {{ route.params.tag }}
      </h1>
    </div>

    <div v-if="status === 'pending'" class="text-center py-12 text-gray-400">
      Loading...
    </div>
    <div v-else-if="!recipes?.length" class="text-center py-12 text-gray-400">
      No recipes with this tag.
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <RecipeRecipeCard
        v-for="recipe in recipes"
        :key="recipe.id"
        :recipe="recipe"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

const { data: recipes, status } = useFetch("/api/recipes", {
  query: { tag: route.params.tag },
});
</script>
