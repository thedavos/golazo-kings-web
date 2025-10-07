<template>
  <q-input
    v-model="searchQuery"
    outlined
    dense
    rounded
    autofocus
    name="searchQuery"
    placeholder="Nombre, posición o equipo..."
    input-class="text-Extended-Text"
    bg-color=""
    color="primary"
    :loading="isLoading"
    @focus="onFocus"
    @blur="onBlur"
  >
    <template #prepend>
      <q-icon name="la la-search" size="xs" color="primary" class="mr-1" />
    </template>

    <template v-if="searchQuery" #append>
      <q-icon
        name="la la-close"
        size="xs"
        class="cursor-pointer"
        color="primary"
        @click="cleanQuery"
      />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSharedPlayerSearch } from 'src/modules/players/composables/usePlayerSearch';

interface Props {
  isLoading: boolean;
}

defineProps<Props>();

const { searchQuery } = useSharedPlayerSearch();

// Reactive state
const isFocused = ref(false);

// Methods
const onFocus = () => {
  isFocused.value = true;
};

const onBlur = () => {
  // Delay para permitir clics en sugerencias
  setTimeout(() => {
    isFocused.value = false;
    // showSuggestions.value = false;
  }, 200);
};

const cleanQuery = () => {
  searchQuery.value = '';
};
</script>
