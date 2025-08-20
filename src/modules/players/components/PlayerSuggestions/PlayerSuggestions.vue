<template>
  <div class="flex gap-2">
    <q-badge
      v-for="(suggestion, index) in suggestions"
      class="cursor-pointer"
      :key="`suggestion-${index}`"
      :label="suggestion"
      @click="selectSuggestion(suggestion)"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  suggestions: Readonly<string[]>;
}

defineProps<Props>();

const emit = defineEmits(['select-suggestion']);

const selectSuggestion = (suggestion: string) => {
  emit('select-suggestion', suggestion);
};
</script>
