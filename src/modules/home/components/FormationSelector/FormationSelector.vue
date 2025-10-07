<template>
  <div class="w-full">
    <label class="block text-sm font-medium text-gray-300 mb-2">Formación táctica</label>
    <q-select
      :model-value="selectedFormation"
      :options="formationOptions"
      outlined
      dense
      map-options
      option-label="label"
      option-value="value"
      name="selectFormation"
      color="primary"
      bg-color="slate-700"
      label="Selecciona una formación"
      label-color="white"
      class="bg-gray-800/50 rounded-lg"
      dropdown-icon="fa fa-caret-down"
      popup-content-class="bg-slate-800 text-white"
      @update:model-value="handleFormationChange"
    >
      <template #option="{ opt, toggleOption }">
        <q-item
          clickable
          @click="toggleOption(opt)"
          :disable="opt.value === 'Personalizado' && !canSelectCustom"
        >
          <q-item-section>
            <q-item-label>{{ opt.label }}</q-item-label>
            <q-item-label caption class="text-gray-400">
              {{ opt.description }} • {{ opt.players }}
            </q-item-label>
          </q-item-section>
          <q-item-section side v-if="opt.value === 'Personalizado'">
            <q-icon name="fas fa-lock" size="xs" class="text-gray-500" v-if="!canSelectCustom" />
            <q-icon name="fas fa-edit" size="xs" class="text-purple-400" v-else />
          </q-item-section>
        </q-item>
      </template>

      <template #selected-item="{ opt }">
        <span class="text-white">{{ opt.label }}</span>
      </template>
    </q-select>

    <div v-if="selectedFormation === 'Personalizado'" class="mt-2 text-xs text-purple-300">
      <q-icon name="fas fa-info-circle" class="mr-1" />
      Arrastra a los jugadores directamente en el campo para posicionarlos libremente
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CONST } from 'src/modules/lineup-builder/constants';
import type { FormationName } from 'src/modules/lineup-builder/types';

interface Props {
  selectedFormation: FormationName;
  canSelectCustom?: boolean;
}

interface FormationOption {
  label: string;
  value: FormationName;
  description: string;
  players: string;
}

const props = withDefaults(defineProps<Props>(), {
  canSelectCustom: false,
});

const emit = defineEmits<{
  'update:selectedFormation': [formation: FormationName];
}>();

const formationOptions = computed<FormationOption[]>(() => {
  return CONST.FORMATION.FORMATION_OPTIONS.map((option) => ({
    ...option,
    value: option.value,
  }));
});

const handleFormationChange = (newFormation: FormationOption) => {
  // Don't allow direct selection of "Personalizado" unless explicitly allowed
  if (newFormation.value === 'Personalizado' && !props.canSelectCustom) {
    return;
  }

  emit('update:selectedFormation', newFormation.value);
};
</script>
