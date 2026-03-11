<template>
  <div>
    <template v-if="groups.length > 1 || (groups.length === 1 && groups[0].name)">
      <div v-for="group in groups" :key="group.name || 'default'" class="mb-6 last:mb-0">
        <h4 v-if="group.name" class="text-sm font-medium text-muted uppercase tracking-wide mb-3">
          {{ group.name }}
        </h4>
        <ol class="space-y-5">
          <li v-for="step in group.items" :key="step.id" class="flex items-start gap-3">
            <span
              class="shrink-0 grow-0 size-7 rounded-full bg-terra-light text-terracotta text-sm font-serif inline-flex items-center justify-center"
            >
              {{ step.stepNumber }}
            </span>
            <p class="flex-1 min-w-0 text-charcoal leading-relaxed pt-0.5">{{ step.text }}</p>
          </li>
        </ol>
      </div>
    </template>
    <ol v-else class="space-y-5">
      <li v-for="step in instructions" :key="step.id" class="flex items-start gap-3">
        <span
          class="shrink-0 grow-0 size-7 rounded-full bg-terra-light text-terracotta text-sm font-serif inline-flex items-center justify-center"
        >
          {{ step.stepNumber }}
        </span>
        <p class="flex-1 min-w-0 text-charcoal leading-relaxed pt-0.5">{{ step.text }}</p>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
interface Instruction {
  id: number;
  stepNumber: number;
  group: string | null;
  text: string;
}

const props = defineProps<{ instructions: Instruction[] }>();

const groups = computed(() => {
  const map = new Map<string, Instruction[]>();
  for (const inst of props.instructions) {
    const key = inst.group || "";
    const list = map.get(key) || [];
    list.push(inst);
    map.set(key, list);
  }
  return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
});
</script>
