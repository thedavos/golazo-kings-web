<template>
  <div
    class="relative bg-black/10 rounded-lg border-2 border-dashed border-slate-500/50 hover:border-purple-400/50 transition-all duration-200 min-h-[80px] flex flex-col items-center justify-center p-2 cursor-pointer"
    @dragover.prevent
    @drop="handleDrop"
    @click="handleAdd"
  >
    <!-- Player in bench slot -->
    <div v-if="player" class="w-full">
      <div
        :style="{ width: `${positionDimension}px`, height: `${positionDimension}px` }"
        :class="[
          'mx-auto rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform border-2 shadow-md',
          isKings ? 'from-yellow-300 to-yellow-600' : 'from-blue-300 to-blue-600',
        ]"
        @click="handleRemove"
      >
        <span class="text-xs font-bold text-white">{{ playerInitials }}</span>
      </div>

      <div class="text-center mt-1">
        <div class="text-xs font-medium text-white truncate">
          {{ player.firstName }} {{ player.lastName }}
        </div>
        <div class="text-xs text-gray-400">{{ player.position }}</div>

        <!-- Quick swap button -->
        <q-btn size="xs" color="purple" flat class="mt-1 text-xs" @click="showSwapDialog = true">
          <q-icon name="fa fa-arrows-rotate" size="xs" />
        </q-btn>
      </div>
    </div>

    <!-- Empty bench slot -->
    <div v-else class="text-center">
      <div
        :style="{ width: `${positionDimension}px`, height: `${positionDimension}px` }"
        class="mx-auto rounded-full border-2 border-dashed border-white/50 flex items-center justify-center bg-black/10 hover:bg-black transition-colors ease-in cursor-pointer"
      >
        <q-icon name="fa fa-plus" class="text-slate-400" size="sm" />
      </div>
      <div class="text-xs text-slate-400 mt-1">{{ benchSlot.label }}</div>
    </div>

    <!-- Swap Dialog -->
    <q-dialog v-if="player" v-model="showSwapDialog">
      <q-card class="bg-slate-800 text-white min-w-[300px]">
        <q-card-section class="pb-2">
          <div class="text-h6 flex items-center gap-2">
            <q-icon name="swap_horiz" class="text-purple-400" />
            Intercambiar jugador
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-sm mb-3">
            Selecciona la posición en el campo para intercambiar con {{ player.firstName }}:
          </div>

          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div
              v-for="pos in availableFieldPositions"
              :key="pos.id"
              class="flex items-center justify-between p-2 bg-slate-700 rounded-lg hover:bg-slate-600"
              @click="handleSwap(pos.id)"
            >
              <div class="flex items-center gap-2">
                <q-badge :label="pos.abbreviation" color="blue" outline />
                <span class="text-sm">{{ pos.position }}</span>
              </div>
              <div v-if="fieldPlayer && fieldPlayer[pos.id]" class="text-xs text-gray-400">
                {{ fieldPlayer[pos.id]?.firstName }}
              </div>
              <div v-else class="text-xs text-green-400">Vacío</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="showSwapDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { getInitials } from 'src/modules/shared/utils/initials.util';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { BenchSlot, FieldPositions } from 'src/modules/lineup-builder/components/LineupField';
import type { LeagueOption } from 'src/modules/home/components/HomeDemoBuilder';

interface Props {
  benchSlot: BenchSlot;
  player: PlayerDto;
  selectedLeague: LeagueOption;
  fieldPositions: FieldPositions;
  fieldPlayer: Record<string, PlayerDto>;
  isKings: boolean;
  positionDimension: number;
}

const props = defineProps<Props>();

const emit = defineEmits(['drop', 'remove', 'swap-to-field', 'add']);

const showSwapDialog = ref(false);

// Computed
const availableFieldPositions = computed(() => {
  return props.fieldPositions || [];
});

const playerInitials = computed(() => getInitials(props.player.firstName, props.player.lastName));

// Methods
const handleDrop = (e: Event) => {
  e.preventDefault();
  emit('drop', props.benchSlot.id);
};

const handleRemove = () => {
  emit('remove', props.benchSlot.id);
};

const handleSwap = (fieldPositionId: string) => {
  emit('swap-to-field', props.benchSlot.id, fieldPositionId);
  showSwapDialog.value = false;
};

const handleAdd = (e: Event) => {
  e.preventDefault();
  emit('add', props.benchSlot.id);
};
</script>
