<template>
  <q-input
    v-model="searchQuery"
    name="searchQuery"
    outlined
    dense
    rounded
    autofocus
    placeholder="Nombre, posición o equipo..."
    input-class="text-white"
    bg-color="slate-800"
    color="blue"
    class="text-white w-full"
    :loading="isLoading"
    @focus="onFocus"
    @blur="onBlur"
  >
    <template #prepend>
      <q-icon name="fa fa-search" size="xs" color="white" class="mr-1" />
    </template>
    <template v-if="searchQuery" #append>
      <q-icon
        name="fa fa-close"
        size="xs"
        class="cursor-pointer"
        color="white"
        @click="cleanQuery"
      />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSharedPlayerSearch } from 'src/modules/players/composables/usePlayerSearch';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

interface Props {
  players: PlayerDto[];
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
