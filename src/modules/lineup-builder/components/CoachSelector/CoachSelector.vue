<template>
  <q-select
    :model-value="modelValue"
    dense
    outlined
    emit-value
    map-options
    use-input
    label="Entrenador"
    name="coach"
    hint="Selecciona el entrenador"
    option-value="label"
    option-label="label"
    dropdown-icon="la la-caret-down"
    input-debounce="300"
    :options="coachOptions"
    @update:model-value="handleUpdate"
    @filter="filterCoaches"
  >
    <template #prepend>
      <q-icon name="la la-user-tie" />
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template #selected>
      <div v-if="selectedCoach" class="flex items-center gap-2">
        <span>{{ selectedCoach.label }}</span>
      </div>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  LIST_OPTIONS as COACH_LIST,
  type CoachSelectOption,
} from 'src/modules/lineup-builder/constants/coach.constant';

interface Props {
  modelValue: string | CoachSelectOption | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: string | CoachSelectOption];
  coachSelected: [coach: CoachSelectOption];
}>();

const coachOptions = ref<CoachSelectOption[]>(COACH_LIST);

// Computed: Coach seleccionado
const selectedCoach = computed(() => {
  if (!props.modelValue) return null;

  const value = typeof props.modelValue === 'string' ? props.modelValue : props.modelValue.label;
  return coachOptions.value.find((coach) => coach.label === value) || null;
});

// Manejar actualización
const handleUpdate = (value: string) => {
  const coach = coachOptions.value.find((c) => c.label === value);
  if (coach) {
    emit('update:modelValue', value);
    emit('coachSelected', coach);
  }
};

// Filtrar coaches
const filterCoaches = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (val === '') {
      coachOptions.value = COACH_LIST;
    } else {
      const needle = val.toLowerCase();
      coachOptions.value = COACH_LIST.filter((coach) => coach.label.toLowerCase().includes(needle));
    }
  });
};
</script>
