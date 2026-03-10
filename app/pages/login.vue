<template>
  <div class="max-w-sm mx-auto mt-12">
    <h1 class="text-xl font-semibold text-gray-900 mb-4">Login</h1>
    <form @submit.prevent="login">
      <div v-if="error" class="text-sm text-red-600 mb-4">{{ error }}</div>
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
        class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      />
      <button
        type="submit"
        class="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
      >
        Login
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const password = ref("");
const error = ref("");
const token = useCookie("auth_token", { maxAge: 60 * 60 * 24 * 30 });

async function login() {
  error.value = "";
  // Test the token by making a request
  try {
    await $fetch("/api/recipes", {
      method: "POST",
      headers: { Authorization: `Bearer ${password.value}` },
      body: { title: "__auth_test__" },
    });
    // If it somehow works, delete the test recipe (shouldn't reach here with validation)
  } catch (e: any) {
    if (e?.statusCode === 403 || e?.statusCode === 401) {
      error.value = "Invalid password";
      return;
    }
    // 400 = validation error means auth passed
    if (e?.statusCode === 400) {
      token.value = password.value;
      navigateTo("/");
      return;
    }
    error.value = "Something went wrong";
    return;
  }
  token.value = password.value;
  navigateTo("/");
}
</script>
