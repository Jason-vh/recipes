<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
    <div class="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="text-lg font-semibold text-gray-900">
        Recipes
      </NuxtLink>
      <nav class="flex items-center gap-4">
        <NuxtLink
          to="/"
          class="text-sm text-gray-600 hover:text-gray-900"
        >
          Browse
        </NuxtLink>
        <NuxtLink
          v-if="isLoggedIn"
          to="/recipes/new"
          class="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
        >
          New Recipe
        </NuxtLink>
        <NuxtLink
          v-if="!isLoggedIn"
          to="/login"
          class="text-sm text-gray-600 hover:text-gray-900"
        >
          Login
        </NuxtLink>
        <button
          v-else
          class="text-sm text-gray-600 hover:text-gray-900"
          @click="logout"
        >
          Logout
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const authToken = useCookie("auth_token");
const isLoggedIn = computed(() => !!authToken.value);

function logout() {
  authToken.value = null;
  navigateTo("/");
}
</script>
