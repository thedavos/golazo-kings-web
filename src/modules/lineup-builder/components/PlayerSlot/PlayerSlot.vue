<template>
  <div
    :class="[
      'p-2 cursor-pointer border-2 transition-all rounded-lg duration-200',
      type === 'field'
        ? 'absolute transform -translate-x-1/2 -translate-y-1/2 w-auto md:min-w-24'
        : 'relative border-slate-500/50 min-h-[80px] flex flex-col items-center justify-center',
      player || selected ? 'border-solid bg-gray-900' : 'border-dashed bg-gray-800',
    ]"
    :style="type === 'field' ? { left: `${position?.x}%`, top: `${position?.y}%` } : {}"
    @dragover.prevent
    @drop="handleDrop"
    @click="handleClick"
  >
    <q-menu
      v-if="player"
      class="border border-slate-500 rounded-borders bg-gray-800"
      :anchor="type === 'field' ? 'top right' : 'bottom right'"
      :self="type === 'field' ? 'top left' : 'bottom left'"
      :offset="[5, 0]"
    >
      <q-list bordered dense separator>
        <q-item v-if="type === 'bench'" clickable @click="showSwapDialog = true">
          <q-item-section>Intercambiar jugador</q-item-section>
        </q-item>
        <q-item clickable @click="showSalaryDialog = true">
          <q-item-section>Editar salario</q-item-section>
        </q-item>
        <q-item clickable @click="handleRemove">
          <q-item-section>Quitar jugador</q-item-section>
        </q-item>
      </q-list>
    </q-menu>

    <!-- Player assigned to slot -->
    <div v-if="player" class="w-full">
      <div
        :style="{ width: `${positionDimension}px`, height: `${positionDimension}px` }"
        :class="[
          'mx-auto rounded-full flex items-center justify-center cursor-pointer transition-transform border-2 shadow-md',
          type === 'bench' ? 'hover:scale-105' : '',
          isKings ? 'from-yellow-300 to-yellow-600' : 'from-blue-300 to-blue-600',
        ]"
      >
        <q-avatar
          v-if="player.profileImageUrl && type === 'field'"
          rounded
          size="lg"
          class="overflow-hidden"
        >
          <q-img :src="player.profileImageUrl" fit="cover" />
        </q-avatar>
        <span v-else class="text-xs font-bold text-white">{{ player.positionAbbreviation }}</span>
      </div>

      <div
        v-if="player.marketValue"
        class="absolute text-[8px] pl-1 pt-0.5 font-bold text-yellow-400 top-0 left-0"
      >
        {{ formatter(player.marketValue) }}
      </div>

      <div class="text-center mt-1">
        <div class="text-xs font-medium text-white truncate">
          {{ displayName }}
        </div>
      </div>
    </div>

    <!-- Empty slot -->
    <div
      v-else
      :class="
        type === 'field' ? 'flex column items-center justify-center text-center' : 'text-center'
      "
    >
      <div
        :style="{ width: `${positionDimension}px`, height: `${positionDimension}px` }"
        :class="[
          'rounded-full border-2 border-dashed border-white/50 flex items-center justify-center bg-black/10 transition-colors ease-in',
          type === 'field' ? 'text-center' : 'mx-auto cursor-pointer',
        ]"
      >
        <q-icon class="text-slate-400" name="fas fa-plus" size="sm" />
      </div>

      <p
        v-if="type === 'field'"
        class="hidden md:block text-xs font-medium text-slate-400 m-0 mt-1 p-0"
      >
        {{ position?.abbreviation }}
      </p>
      <div v-else class="text-xs text-slate-400 mt-1">{{ benchSlot?.label }}</div>
    </div>

    <player-edit-salary-dialog
      v-model="showSalaryDialog"
      :player="player"
      :formatter="formatter"
      @update:salary="emit('update:salary', $event)"
    />

    <!-- Swap Dialog (only for bench) -->
    <q-dialog v-if="player && type === 'bench'" v-model="showSwapDialog" seamless>
      <q-card class="bg-slate-800 text-white min-w-[300px]">
        <q-card-section class="pb-2">
          <div class="text-h6 flex items-center gap-2">
            <q-icon name="fa fa-arrow-right-arrow-left" class="text-purple-400" />
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
          <q-btn flat label="Cerrar" @click="showSwapDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { PlayerEditSalaryDialog } from 'src/modules/players/dialogs/PlayerEditSalaryDialog';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type {
  FieldPosition,
  BenchSlot,
  FieldPositions,
} from 'src/modules/lineup-builder/components/LineupField';
import type { LeagueOption } from 'src/modules/home/components/HomeDemoBuilder';

interface Props {
  type: 'field' | 'bench';
  player: PlayerDto | undefined;
  positionDimension: number;
  isKings: boolean;
  selected: boolean;
  formatter: (value: number) => string;
  // Field-specific props
  position?: FieldPosition;
  // Bench-specific props
  benchSlot?: BenchSlot;
  selectedLeague?: LeagueOption;
  fieldPositions?: FieldPositions;
  fieldPlayer?: Record<string, PlayerDto>;
}

const props = defineProps<Props>();

const emit = defineEmits(['drop', 'remove', 'add', 'deselect', 'update:salary', 'swap']);

const showSalaryDialog = ref(false);
const showSwapDialog = ref(false);

// Computed
const availableFieldPositions = computed(() => {
  return props.fieldPositions || [];
});

const fullName = computed(() => `${props.player?.firstName} ${props.player?.lastName}`);
const displayName = computed(() =>
  fullName.value.length >= 14 ? props.player?.lastName : fullName.value,
);

// Methods
const handleDrop = (e: Event) => {
  e.preventDefault();
  if (props.type === 'field') {
    emit('drop', props.position?.id, props.position?.abbreviation);
  } else {
    emit('drop', props.benchSlot?.id);
  }
};

const handleClick = (e: Event) => {
  e.preventDefault();
  if (props.player) return;

  if (props.selected) {
    emit('deselect', props.type === 'field' ? props.position?.id : props.benchSlot?.id);
    return;
  }

  if (props.type === 'field') {
    emit('add', props.position?.id, props.position?.abbreviation);
  } else {
    emit('add', props.benchSlot?.id);
  }
};

const handleRemove = (e?: Event) => {
  if (e) e.preventDefault();
  emit('remove', props.type === 'field' ? props.position?.id : props.benchSlot?.id);
};

const handleSwap = (fieldPositionId: string) => {
  emit('swap', props.benchSlot?.id, fieldPositionId);
  showSwapDialog.value = false;
};
</script>
