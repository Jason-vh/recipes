<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Title -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
      <input
        v-model="form.title"
        required
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Description -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea
        v-model="form.description"
        rows="2"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Times & Servings -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div>
        <label class="block text-xs text-gray-500 mb-1">Prep (min)</label>
        <input
          v-model.number="form.prepTime"
          type="number"
          min="0"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label class="block text-xs text-gray-500 mb-1">Cook (min)</label>
        <input
          v-model.number="form.cookTime"
          type="number"
          min="0"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label class="block text-xs text-gray-500 mb-1">Total (min)</label>
        <input
          v-model.number="form.totalTime"
          type="number"
          min="0"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label class="block text-xs text-gray-500 mb-1">Servings</label>
        <input
          v-model="form.servings"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <!-- Source -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="block text-xs text-gray-500 mb-1">Source</label>
        <input
          v-model="form.source"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label class="block text-xs text-gray-500 mb-1">Source URL</label>
        <input
          v-model="form.sourceUrl"
          type="url"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <!-- Image URL -->
    <div>
      <label class="block text-xs text-gray-500 mb-1">Image URL</label>
      <input
        v-model="form.imageUrl"
        type="url"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Ingredients -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm font-medium text-gray-700">Ingredients</label>
        <button
          type="button"
          class="text-xs text-blue-600 hover:text-blue-700"
          @click="addIngredient"
        >
          + Add ingredient
        </button>
      </div>
      <div class="space-y-2">
        <div v-for="(ing, idx) in form.ingredients" :key="idx" class="flex gap-2 items-start">
          <input
            v-model="ing.amount"
            placeholder="Amt"
            class="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
          />
          <input
            v-model="ing.unit"
            placeholder="Unit"
            class="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
          />
          <input
            v-model="ing.item"
            placeholder="Ingredient"
            required
            class="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
          />
          <input
            v-model="ing.notes"
            placeholder="Notes"
            class="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm hidden sm:block"
          />
          <button
            type="button"
            class="text-gray-400 hover:text-red-500 p-1.5"
            @click="form.ingredients.splice(idx, 1)"
          >
            &times;
          </button>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm font-medium text-gray-700">Instructions</label>
        <button
          type="button"
          class="text-xs text-blue-600 hover:text-blue-700"
          @click="addInstruction"
        >
          + Add step
        </button>
      </div>
      <div class="space-y-2">
        <div v-for="(step, idx) in form.instructions" :key="idx" class="flex gap-2 items-start">
          <span class="shrink-0 w-6 h-8 flex items-center justify-center text-xs text-gray-400">
            {{ idx + 1 }}.
          </span>
          <textarea
            v-model="step.text"
            required
            rows="2"
            class="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
          />
          <button
            type="button"
            class="text-gray-400 hover:text-red-500 p-1.5"
            @click="form.instructions.splice(idx, 1)"
          >
            &times;
          </button>
        </div>
      </div>
    </div>

    <!-- Tags -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
      <div class="flex flex-wrap gap-2 mb-2">
        <span
          v-for="(tag, idx) in form.tags"
          :key="idx"
          class="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-sm rounded-full"
        >
          {{ tag }}
          <button
            type="button"
            class="text-gray-400 hover:text-red-500"
            @click="form.tags.splice(idx, 1)"
          >
            &times;
          </button>
        </span>
      </div>
      <div class="flex gap-2">
        <input
          v-model="newTag"
          placeholder="Add tag..."
          class="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
          @keydown.enter.prevent="addTag"
        />
        <button type="button" class="text-sm text-blue-600 hover:text-blue-700" @click="addTag">
          Add
        </button>
      </div>
    </div>

    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
      <textarea
        v-model="form.notes"
        rows="3"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Favorite -->
    <label class="flex items-center gap-2">
      <input v-model="form.isFavorite" type="checkbox" class="rounded" />
      <span class="text-sm text-gray-700">Favorite</span>
    </label>

    <!-- Submit -->
    <button
      type="submit"
      :disabled="loading"
      class="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
    >
      {{ loading ? "Saving..." : initial ? "Update Recipe" : "Create Recipe" }}
    </button>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{
  initial?: any;
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [data: any];
}>();

const newTag = ref("");

const form = reactive({
  title: props.initial?.title || "",
  description: props.initial?.description || "",
  prepTime: props.initial?.prepTime || null,
  cookTime: props.initial?.cookTime || null,
  totalTime: props.initial?.totalTime || null,
  servings: props.initial?.servings || "",
  source: props.initial?.source || "",
  sourceUrl: props.initial?.sourceUrl || "",
  imageUrl: props.initial?.imageUrl || "",
  notes: props.initial?.notes || "",
  isFavorite: props.initial?.isFavorite || false,
  ingredients: (props.initial?.ingredients || []).map((ing: any) => ({
    amount: ing.amount || "",
    unit: ing.unit || "",
    item: ing.item || "",
    notes: ing.notes || "",
    group: ing.group || "",
  })),
  instructions: (props.initial?.instructions || []).map((inst: any) => ({
    text: inst.text || "",
    group: inst.group || "",
  })),
  tags: (props.initial?.tags || []).map((t: any) => (typeof t === "string" ? t : t.name)),
});

function addIngredient() {
  form.ingredients.push({ amount: "", unit: "", item: "", notes: "", group: "" });
}

function addInstruction() {
  form.instructions.push({ text: "", group: "" });
}

function addTag() {
  const tag = newTag.value.trim();
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag);
  }
  newTag.value = "";
}

function handleSubmit() {
  const data: any = {
    title: form.title,
    description: form.description || null,
    prepTime: form.prepTime || null,
    cookTime: form.cookTime || null,
    totalTime: form.totalTime || null,
    servings: form.servings || null,
    source: form.source || null,
    sourceUrl: form.sourceUrl || null,
    imageUrl: form.imageUrl || null,
    notes: form.notes || null,
    isFavorite: form.isFavorite,
    ingredients: form.ingredients
      .filter((ing: any) => ing.item.trim())
      .map((ing: any, idx: number) => ({
        sortOrder: idx,
        group: ing.group || null,
        amount: ing.amount || null,
        unit: ing.unit || null,
        item: ing.item.trim(),
        notes: ing.notes || null,
      })),
    instructions: form.instructions
      .filter((inst: any) => inst.text.trim())
      .map((inst: any, idx: number) => ({
        stepNumber: idx + 1,
        group: inst.group || null,
        text: inst.text.trim(),
      })),
    tags: form.tags,
  };

  emit("submit", data);
}
</script>
