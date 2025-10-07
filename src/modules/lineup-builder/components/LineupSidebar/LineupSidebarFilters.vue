<template>
  <div class="row gap-2">
    <div class="col-4 grow">
      <q-select
        v-model="filters.league"
        dense
        outlined
        rounded
        option-label="label"
        option-value="value"
        dropdown-icon="la la-caret-down"
        name="league"
        label="Liga"
        :options="CONST.LEAGUE.LIST_OPTIONS"
      />
    </div>
    <div class="col-4 grow">
      <q-select
        v-model="filters.team"
        dense
        outlined
        rounded
        option-label="label"
        option-value="value"
        dropdown-icon="la la-caret-down"
        name="team"
        label="Equipo"
        :options="teamListByLeague"
      />
    </div>
    <div class="col-4 grow">
      <q-select
        v-model="filters.position"
        dense
        outlined
        rounded
        option-label="label"
        option-value="value"
        dropdown-icon="la la-caret-down"
        name="position"
        label="Posición"
        :options="positionsByLeague"
      />
    </div>
    <div class="col-4 grow">
      <q-select
        v-model="orderBy"
        dense
        outlined
        rounded
        option-label="label"
        option-value="value"
        dropdown-icon="la la-caret-down"
        name="orderBy"
        label="Ordenar por"
        :options="CONST.ORDER_BY.LIST_OPTIONS"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useLineupStore } from 'stores/useLineupStore';
import { CONST } from 'src/modules/lineup-builder/constants';

const lineupStore = useLineupStore();

const { filters, orderBy } = storeToRefs(lineupStore);

const teamListByLeague = computed(() => {
  if (filters.value.league?.value === 'all') {
    return CONST.TEAM.LIST_OPTIONS;
  }

  if (filters.value.league?.value === 'kings') {
    return CONST.TEAM.LIST_OPTIONS.filter((team) => team.type === 'kings');
  }

  if (filters.value.league?.value === 'queens') {
    return CONST.TEAM.LIST_OPTIONS.filter((team) => team.type === 'queens');
  }

  return CONST.TEAM.LIST_OPTIONS.filter((team) => {
    const leagueFilter = filters.value.league?.value;

    return team.leagueId === +leagueFilter!;
  });
});

const positionsByLeague = computed(() => {
  return CONST.PLAYER_POSITION.LIST_OPTIONS.filter((position) => {
    if (position.type === 'all') return true;
    if (filters.value.league?.type === 'all') return true;

    return filters.value.league?.value === position.type;
  });
});
</script>
