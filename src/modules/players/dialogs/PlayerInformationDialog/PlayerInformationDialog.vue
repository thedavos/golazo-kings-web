<template>
  <q-dialog
    ref="dialogRef"
    transition-show="jump-up"
    transition-hide="jump-down"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin" style="min-width: 500px">
      <go-toolbar-header title="Información del Jugador" />

      <q-card-section class="pt-6">
        <!-- Foto del Jugador -->
        <div class="space-y-3 mb-4">
          <div class="text-sm font-semibold text-gray-700 text-center">Foto del Jugador</div>

          <div class="relative">
            <div
              class="relative w-48 h-48 mx-auto rounded-lg border-2 border-gray-300 overflow-hidden"
            >
              <!-- Imagen del jugador -->
              <q-img :src="displayImageUrl" fit="contain" class="w-full h-full">
                <template #loading>
                  <div class="absolute-full flex items-center justify-center bg-gray-100">
                    <q-spinner color="primary" size="md" />
                  </div>
                </template>
                <template #error>
                  <q-img :src="emptyPlayerImage" fit="contain" class="w-full h-full" />
                </template>
              </q-img>
            </div>
          </div>
        </div>

        <q-separator />

        <!-- Información del jugador -->
        <div class="space-y-4 mt-4">
          <!-- Nombres -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-gray-500 mb-1">Nombre</div>
              <div class="text-base font-medium text-gray-900">
                {{ player.firstName || '-' }}
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Apellido</div>
              <div class="text-base font-medium text-gray-900">
                {{ player.lastName || '-' }}
              </div>
            </div>
          </div>

          <!-- Nickname -->
          <div>
            <div class="text-xs text-gray-500 mb-1">Apodo</div>
            <div class="text-base font-medium text-gray-900">
              {{ player.nickname || '-' }}
            </div>
          </div>

          <!-- Market Value y Rating -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-gray-500 mb-1">Salario</div>
              <div class="text-base font-medium text-gray-900">
                {{ formattedMarketValue }}
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Rating</div>
              <div class="text-base font-medium text-gray-900">
                {{ formattedRating }}
              </div>
            </div>
          </div>

          <!-- Equipo -->
          <div>
            <div class="text-xs text-gray-500 mb-1">Equipo</div>
            <div v-if="selectedTeam" class="flex items-center gap-2">
              <q-avatar size="sm">
                <img :src="selectedTeam.logo" alt="team logo" />
              </q-avatar>
              <span class="text-base font-medium text-gray-900">{{ selectedTeam.label }}</span>
            </div>
            <div v-else class="text-base font-medium text-gray-900">-</div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="pb-4 pr-4">
        <q-btn color="primary" no-caps unelevated label="Cerrar" @click="onDialogOK" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import emptyPlayerImage from 'src/assets/player/empty-player.png';
import { GoToolbarHeader } from 'src/modules/shared/components/GoToolbarHeader';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import { LIST_OPTIONS as TEAM_LIST } from 'src/modules/lineup-builder/constants/team.constant';
import { useLineupStore } from 'stores/useLineupStore';
import { storeToRefs } from 'pinia';

interface Props {
  player: PlayerDto;
}

const props = defineProps<Props>();

defineEmits([...useDialogPluginComponent.emits]);

const lineupStore = useLineupStore();
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

const { currency } = storeToRefs(lineupStore);

// Obtener lista de equipos según el tipo de jugador
const teamList = TEAM_LIST.filter((team) =>
  props.player.isQueensLeaguePlayer ? team.type === 'queens' : team.type === 'kings',
);

// Computed: URL de la imagen a mostrar (foto o placeholder)
const displayImageUrl = computed(() => {
  return props.player.profileImageUrl || emptyPlayerImage;
});

// Computed: Equipo seleccionado
const selectedTeam = computed(() => {
  return teamList.find((team) => team.label === props.player.team);
});

// Computed: Salario formateado
const formattedMarketValue = computed(() => {
  if (props.player.marketValue === null || props.player.marketValue === undefined) {
    return '-';
  }
  return `${currency.value.symbol}${props.player.marketValue.toLocaleString()}`;
});

// Computed: Rating formateado
const formattedRating = computed(() => {
  if (props.player.rating === null || props.player.rating === undefined) {
    return '-';
  }
  return props.player.rating.toFixed(2);
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
