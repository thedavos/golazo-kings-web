<template>
  <q-card
    flat
    bordered
    class="player-summary-card hover:shadow-md transition-shadow cursor-pointer"
  >
    <q-card-section class="p-3" @click="emit('view-details', player)">
      <div class="flex items-center gap-3">
        <!-- Foto del jugador -->
        <div class="flex-shrink-0">
          <q-avatar rounded size="40px">
            <q-img
              :src="player.profileImageUrl || emptyPlayerImage"
              :alt="`${player.firstName} ${player.lastName}`"
              class="object-contain"
            >
              <template #error>
                <q-img :src="emptyPlayerImage" fit="cover" />
              </template>
            </q-img>
          </q-avatar>
        </div>

        <!-- Información del jugador -->
        <div class="flex-grow min-w-0">
          <!-- Nombre -->
          <div class="font-semibold text-Extended-Text text-base truncate">
            {{ player.firstName }} {{ player.lastName }}
          </div>

          <!-- Apodo -->
          <div v-if="player.nickname" class="text-sm text-gray-500 truncate italic">
            "{{ player.nickname }}"
          </div>

          <!-- Equipo -->
          <div v-if="player.team" class="flex items-center gap-2 mt-1">
            <q-avatar v-if="teamInfo" size="16px">
              <img :src="teamInfo.logo" :alt="player.team" />
            </q-avatar>
            <span class="text-xs text-gray-600 truncate">{{ player.team }}</span>
          </div>

          <!-- Rating y Salario -->
          <div class="flex items-center gap-3 mt-2">
            <!-- Rating -->
            <div v-if="player.rating" class="flex items-center gap-1">
              <q-icon name="la la-star" size="xs" class="text-yellow-600" />
              <span class="text-xs font-medium text-Extended-Text">
                {{ player.rating.toFixed(1) }}
              </span>
            </div>

            <!-- Salario -->
            <div v-if="player.marketValue" class="flex items-center gap-1">
              <q-icon name="la la-coins" size="xs" class="text-green-600" />
              <span class="text-xs font-medium text-Extended-Text">
                {{ currency.symbol }}{{ player.marketValue.toLocaleString() }}
              </span>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex-shrink-0 flex gap-1">
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="la la-edit"
            color="primary"
            @click.stop="emit('edit', player)"
          >
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="la la-trash"
            color="negative"
            @click.stop="emit('remove', player)"
          >
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>

    <!-- Badge de "En Banca" -->
    <q-badge v-if="isBench" floating color="orange" class="text-xs"> Suplente </q-badge>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useLineupStore } from 'stores/useLineupStore';
import emptyPlayerImage from 'src/assets/player/empty-player.png';
import { LIST_OPTIONS as TEAM_LIST } from 'src/modules/lineup-builder/constants/team.constant';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

interface Props {
  player: PlayerDto;
  isBench?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isBench: false,
});

const emit = defineEmits<{
  'view-details': [player: PlayerDto];
  edit: [player: PlayerDto];
  remove: [player: PlayerDto];
}>();

const lineupStore = useLineupStore();
const { currency } = storeToRefs(lineupStore);

// Obtener información del equipo
const teamList = TEAM_LIST.filter((team) =>
  props.player.isQueensLeaguePlayer ? team.type === 'queens' : team.type === 'kings',
);

const teamInfo = computed(() => {
  return teamList.find((team) => team.label === props.player.team);
});
</script>

<style scoped>
.player-summary-card {
  transition: all 0.2s ease;
}

.player-summary-card:hover {
  transform: translateY(-1px);
}
</style>
