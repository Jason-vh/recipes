<template>
  <div v-if="recipe">
    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ recipe.title }}</h1>
        <p v-if="recipe.description" class="text-gray-500 mt-1">
          {{ recipe.description }}
        </p>
      </div>
      <div v-if="isLoggedIn" class="flex gap-2 shrink-0">
        <NuxtLink
          :to="`/recipes/${recipe.id}/edit`"
          class="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Edit
        </NuxtLink>
        <button
          class="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
          @click="handleDelete"
        >
          Delete
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
      <span v-if="recipe.prepTime">Prep: {{ recipe.prepTime }} min</span>
      <span v-if="recipe.cookTime">Cook: {{ recipe.cookTime }} min</span>
      <span v-if="recipe.totalTime">Total: {{ recipe.totalTime }} min</span>
      <span v-if="recipe.servings">Servings: {{ recipe.servings }}</span>
      <span v-if="recipe.source"
        >Source: {{ recipe.sourceUrl ? "" : recipe.source
        }}<a
          v-if="recipe.sourceUrl"
          :href="recipe.sourceUrl"
          target="_blank"
          class="text-blue-600 hover:underline"
          >{{ recipe.source || recipe.sourceUrl }}</a
        ></span
      >
    </div>

    <div v-if="recipe.tags?.length" class="flex flex-wrap gap-1.5 mb-6">
      <UiTagPill v-for="tag in recipe.tags" :key="tag.slug" :name="tag.name" :slug="tag.slug" />
    </div>

    <div v-if="recipe.imageUrl" class="rounded-xl overflow-hidden mb-6">
      <img :src="recipe.imageUrl" :alt="recipe.title" class="w-full" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div v-if="recipe.ingredients?.length" class="md:col-span-1">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Ingredients</h2>
        <RecipeIngredientList :ingredients="recipe.ingredients" />
      </div>
      <div v-if="recipe.instructions?.length" class="md:col-span-2">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Instructions</h2>
        <RecipeStepList :instructions="recipe.instructions" />
      </div>
    </div>

    <div v-if="recipe.notes" class="mt-8 p-4 bg-amber-50 rounded-xl">
      <h3 class="text-sm font-medium text-amber-800 mb-1">Notes</h3>
      <p class="text-sm text-amber-700 whitespace-pre-line">{{ recipe.notes }}</p>
    </div>
  </div>
  <div v-else class="text-center py-12 text-gray-400">Recipe not found.</div>
</template>

<script setup lang="ts">
const route = useRoute();
const { token } = useAuth();
const isLoggedIn = computed(() => !!token.value);

const { data: recipe } = await useFetch(`/api/recipes/${route.params.id}`);

async function handleDelete() {
  if (!confirm("Delete this recipe?")) return;

  await $fetch(`/api/recipes/${route.params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token.value}` },
  });

  navigateTo("/");
}
</script>
