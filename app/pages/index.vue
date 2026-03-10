<template>
  <div>
    <div class="mb-6">
      <UiSearchBar v-model="searchQuery" />
    </div>

    <div v-if="tags?.length" class="flex flex-wrap gap-2 mb-6">
      <NuxtLink
        to="/"
        class="px-2.5 py-1 text-xs rounded-full transition-colors"
        :class="!activeTag ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >
        All
      </NuxtLink>
      <NuxtLink
        v-for="tag in tags"
        :key="tag.slug"
        :to="`/tags/${tag.slug}`"
        class="px-2.5 py-1 text-xs rounded-full transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
      >
        {{ tag.name }} ({{ tag.recipeCount }})
      </NuxtLink>
    </div>

    <div v-if="status === 'pending'" class="text-center py-12 text-gray-400">
      Loading recipes...
    </div>
    <div v-else-if="!recipes?.length" class="text-center py-12 text-gray-400">
      No recipes found.
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
const activeTag = computed(() => route.query.tag as string | undefined);

const searchQuery = ref("");
const debouncedQuery = ref("");

let debounceTimer: ReturnType<typeof setTimeout>;
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = val;
  }, 300);
});

const { data: recipes, status } = useFetch("/api/recipes", {
  query: computed(() => ({
    q: debouncedQuery.value || undefined,
    tag: activeTag.value || undefined,
  })),
});

const { data: tags } = useFetch("/api/tags");
</script>
