<template>
  <div v-if="recipe">
    <NuxtLink
      to="/"
      class="inline-block text-sm text-muted hover:text-terracotta transition-colors mb-6"
    >
      &larr; Recipes
    </NuxtLink>

    <div class="mb-5">
      <h1 class="font-serif text-3xl text-warm-brown leading-snug">{{ recipe.title }}</h1>
      <p v-if="recipe.description" class="text-muted mt-2 leading-relaxed">
        {{ recipe.description }}
      </p>
    </div>

    <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted mb-6">
      <span v-if="recipe.prepTime">Prep: {{ recipe.prepTime }} min</span>
      <span v-if="recipe.cookTime">Cook: {{ recipe.cookTime }} min</span>
      <span v-if="recipe.totalTime">Total: {{ recipe.totalTime }} min</span>
      <span v-if="recipe.servings">Servings: {{ recipe.servings }}</span>
      <span v-if="recipe.source">
        Source: {{ recipe.sourceUrl ? "" : recipe.source
        }}<a
          v-if="recipe.sourceUrl"
          :href="recipe.sourceUrl"
          target="_blank"
          class="text-terracotta hover:underline"
          >{{ recipe.source || recipe.sourceUrl }}</a
        >
      </span>
    </div>

    <div v-if="recipe.imageUrl" class="rounded-lg overflow-hidden mb-8">
      <img :src="recipe.imageUrl" :alt="recipe.title" class="w-full" />
    </div>

    <div v-if="recipe.ingredients?.length" class="bg-parchment rounded-xl p-5 mb-8">
      <h2 class="font-serif text-xl text-warm-brown mb-3">Ingredients</h2>
      <RecipeIngredientList :ingredients="recipe.ingredients" />
    </div>

    <div
      v-if="recipe.ingredients?.length && recipe.instructions?.length"
      class="text-center text-parchment select-none mb-8 text-lg tracking-[0.3em]"
    >
      &middot;&middot;&middot;
    </div>

    <div v-if="recipe.instructions?.length">
      <h2 class="font-serif text-xl text-warm-brown mb-4">Instructions</h2>
      <RecipeStepList :instructions="recipe.instructions" />
    </div>

    <div v-if="recipe.notes" class="mt-10 bg-parchment rounded-xl p-5">
      <h3 class="font-serif text-base text-warm-brown mb-2">Notes</h3>
      <p class="text-sm text-charcoal italic whitespace-pre-line leading-relaxed">
        {{ recipe.notes }}
      </p>
    </div>
  </div>
  <div v-else class="text-center py-12 text-muted">Recipe not found.</div>
</template>

<script setup lang="ts">
const route = useRoute();

const { data: recipe } = await useFetch(`/api/recipes/${route.params.id}`);
</script>
