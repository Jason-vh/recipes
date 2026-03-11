<template>
  <div>
    <template v-if="groups.length > 1 || (groups.length === 1 && groups[0].name)">
      <div v-for="group in groups" :key="group.name || 'default'" class="mb-4 last:mb-0">
        <h4 v-if="group.name" class="text-sm font-medium text-muted uppercase tracking-wide mb-2">
          {{ group.name }}
        </h4>
        <ul class="space-y-1.5">
          <li v-for="ing in group.items" :key="ing.id" class="text-sm text-charcoal">
            <span v-if="ing.amount" class="font-medium">{{ ing.amount }}</span>
            <span v-if="ing.unit"> {{ ing.unit }}</span>
            {{ ing.item }}
            <span v-if="ing.notes" class="text-muted">({{ ing.notes }})</span>
          </li>
        </ul>
      </div>
    </template>
    <ul v-else class="space-y-1.5">
      <li v-for="ing in ingredients" :key="ing.id" class="text-sm text-charcoal">
        <span v-if="ing.amount" class="font-medium">{{ ing.amount }}</span>
        <span v-if="ing.unit"> {{ ing.unit }}</span>
        {{ ing.item }}
        <span v-if="ing.notes" class="text-muted">({{ ing.notes }})</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface Ingredient {
  id: number;
  sortOrder: number;
  group: string | null;
  amount: string | null;
  unit: string | null;
  item: string;
  notes: string | null;
}

const props = defineProps<{ ingredients: Ingredient[] }>();

const groups = computed(() => {
  const map = new Map<string, Ingredient[]>();
  for (const ing of props.ingredients) {
    const key = ing.group || "";
    const list = map.get(key) || [];
    list.push(ing);
    map.set(key, list);
  }
  return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
});
</script>
