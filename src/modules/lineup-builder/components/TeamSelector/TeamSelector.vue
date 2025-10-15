<template>
  <q-select
    :model-value="modelValue"
    dense
    outlined
    emit-value
    map-options
    use-input
    label="Equipo"
    name="team"
    hint="Selecciona el equipo"
    option-value="label"
    option-label="label"
    dropdown-icon="la la-caret-down"
    input-debounce="300"
    :options="teamOptions"
    @update:model-value="handleUpdate"
    @filter="filterTeams"
  >
    <template #prepend>
      <q-icon name="la la-shield-alt" />
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section avatar>
          <q-avatar size="sm">
            <img :src="scope.opt.logo" alt="team logo" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
          <q-item-label caption>{{ scope.opt.description }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template #selected>
      <div v-if="selectedTeam" class="flex items-center gap-2">
        <q-avatar size="xs">
          <img :src="selectedTeam.logo" alt="selected team logo" />
        </q-avatar>
        <span>{{ selectedTeam.label }}</span>
      </div>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import {
  LIST_OPTIONS as TEAM_LIST,
  type TeamSelectOption,
} from 'src/modules/lineup-builder/constants/team.constant';
import { useCustomEntitiesStore } from 'stores/useCustomEntitiesStore';
import type { LEAGUE_TYPES } from 'src/modules/lineup-builder/types';

interface Props {
  modelValue: string | TeamSelectOption | null;
  leagueType?: LEAGUE_TYPES;
}

const props = withDefaults(defineProps<Props>(), {
  leagueType: 'all',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | TeamSelectOption];
  teamSelected: [team: TeamSelectOption];
}>();

// Obtener equipos personalizados del store
const customEntitiesStore = useCustomEntitiesStore();
const { customTeams } = storeToRefs(customEntitiesStore);

// Filtrar equipos según el tipo de liga (incluye personalizados)
const filteredTeamList = computed(() => {
  let baseTeams = TEAM_LIST;

  if (props.leagueType !== 'all') {
    baseTeams = TEAM_LIST.filter((team) => team.type === props.leagueType);
  }

  // Agregar equipos personalizados que coincidan con el tipo de liga
  const customTeamsFiltered =
    props.leagueType === 'all'
      ? customTeams.value
      : customTeams.value.filter((team) => team.type === props.leagueType);

  return [...baseTeams, ...customTeamsFiltered];
});

const teamOptions = ref<TeamSelectOption[]>(filteredTeamList.value);

// Computed: Equipo seleccionado
const selectedTeam = computed(() => {
  if (!props.modelValue) return null;

  const value = typeof props.modelValue === 'string' ? props.modelValue : props.modelValue.label;

  return filteredTeamList.value.find((team) => team.label === value);
});

// Manejar actualización
const handleUpdate = (value: string) => {
  const team = filteredTeamList.value.find((t) => t.label === value);
  if (team) {
    emit('update:modelValue', value);
    emit('teamSelected', team);
  }
};

// Filtrar equipos
const filterTeams = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (val === '') {
      teamOptions.value = filteredTeamList.value;
    } else {
      const needle = val.toLowerCase();
      teamOptions.value = filteredTeamList.value.filter((team) =>
        team.label.toLowerCase().includes(needle),
      );
    }
  });
};
</script>
