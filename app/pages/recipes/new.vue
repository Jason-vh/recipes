<template>
  <div>
    <h1 class="text-xl font-semibold text-gray-900 mb-6">New Recipe</h1>
    <RecipeRecipeForm @submit="handleCreate" :loading="loading" />
    <div v-if="error" class="text-sm text-red-600 mt-4">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
const { authHeaders } = useAuth();
const loading = ref(false);
const error = ref("");

async function handleCreate(data: any) {
  loading.value = true;
  error.value = "";
  try {
    const recipe = await $fetch("/api/recipes", {
      method: "POST",
      headers: authHeaders(),
      body: data,
    });
    navigateTo(`/recipes/${(recipe as any).id}`);
  } catch (e: any) {
    error.value = e?.data?.statusMessage || "Failed to create recipe";
  } finally {
    loading.value = false;
  }
}
</script>
