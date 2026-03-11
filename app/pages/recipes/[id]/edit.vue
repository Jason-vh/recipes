<template>
  <div v-if="recipe">
    <h1 class="text-xl font-semibold text-gray-900 mb-6">Edit Recipe</h1>
    <RecipeForm :initial="recipe" @submit="handleUpdate" :loading="loading" />
    <div v-if="error" class="text-sm text-red-600 mt-4">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { authHeaders } = useAuth();
const loading = ref(false);
const error = ref("");

const { data: recipe } = await useFetch(`/api/recipes/${route.params.id}`);

async function handleUpdate(data: any) {
  loading.value = true;
  error.value = "";
  try {
    await $fetch(`/api/recipes/${route.params.id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: data,
    });
    navigateTo(`/recipes/${route.params.id}`);
  } catch (e: any) {
    error.value = e?.data?.statusMessage || "Failed to update recipe";
  } finally {
    loading.value = false;
  }
}
</script>
