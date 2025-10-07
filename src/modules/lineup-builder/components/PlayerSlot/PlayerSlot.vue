<template>
  <div
    :draggable="type === 'field'"
    :class="[
      'cursor-pointer transition-all duration-200',
      type === 'field'
        ? 'absolute transform -translate-x-1/2 -translate-y-1/2 w-auto md:min-w-24 cursor-grab active:cursor-grabbing hover:scale-105'
        : 'relative border-slate-500/50 flex flex-col items-center justify-center min-h-[80px]',
    ]"
    :style="type === 'field' ? { left: `${position?.x}%`, top: `${position?.y}%` } : {}"
    @dragover.prevent
    @drop="handleDrop"
    @click="handleClick"
    @dragstart="handleContainerDragStart"
    @dragend="handleContainerDragEnd"
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
          'mx-auto rounded-full overflow-hidden cursor-pointer transition-transform border-2 shadow-md relative bg-gray-800',
          type === 'bench' ? 'hover:scale-105' : '',
          player || selected ? 'border-solid bg-primary' : 'border-dashed bg-gray-800',
        ]"
      >
        <!-- Player profile image -->
        <div
          v-if="player.profileImageUrl"
          class="w-full h-full bg-cover bg-top bg-no-repeat"
          :style="{ backgroundImage: `url(${player.profileImageUrl})` }"
        />
        <!-- Fallback with initials -->
        <div
          v-else
          class="w-full h-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br"
          :class="isKings ? 'from-yellow-400 to-yellow-600' : 'from-blue-400 to-blue-600'"
        >
          {{ playerInitials }}
        </div>
      </div>

      <!-- Player name overlay (always at bottom) -->
      <div
        v-if="displayName"
        class="absolute -bottom-[10px] left-0 right-0 text-center py-1 text-[10px] font-bold text-white bg-secondary/80 rounded-2xl select-none"
      >
        {{ displayName }}
      </div>

      <!-- Market value (top-left corner) -->
      <div
        v-if="player.marketValue"
        class="absolute text-[10px] px-0.5 py-1 font-bold italic text-yellow-400 tracking-tighter bg-secondary border-1 rounded-md top-0 left-[5px]"
      >
        {{ formatter(player.marketValue) }}
      </div>
    </div>

    <!-- Empty slot -->
    <div v-else class="w-full flex items-center justify-center">
      <div
        :style="{ width: `${positionDimension}px`, height: `${positionDimension}px` }"
        :class="[
          'rounded-full border-2 flex items-center justify-center transition-colors ease-in',
          selected ? 'border-solid bg-gray-900' : 'border-dashed bg-gray-800',
        ]"
      >
        <q-icon class="text-slate-400" name="fas fa-plus" size="sm" />
      </div>
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
import { getInitials } from 'src/modules/shared/utils/initials.util';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { FieldPosition, BenchSlot, FieldPositions } from 'src/modules/lineup-builder/types';
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

const emit = defineEmits([
  'drop',
  'remove',
  'add',
  'deselect',
  'update:salary',
  'swap',
  'dragstart',
  'dragend',
]);

const showSalaryDialog = ref(false);
const showSwapDialog = ref(false);

// Computed
const availableFieldPositions = computed(() => {
  return props.fieldPositions || [];
});

const fullName = computed(() => `${props.player?.firstName} ${props.player?.lastName}`);
const displayName = computed(() =>
  fullName.value.length >= 16 ? props.player?.lastName || playerInitials.value : fullName.value,
);

const playerInitials = computed(() => {
  if (!props.player?.firstName || !props.player?.lastName) return '';
  return getInitials(props.player.firstName, props.player.lastName);
});

// Methods
const handleDrop = (e: DragEvent) => {
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

// Unified container drag handlers
const handleContainerDragStart = (event: DragEvent) => {
  if (props.type !== 'field') return;
  // Calculate the offset between the mouse pointer and the element's position
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();

  // Calculate the offset from the mouse position to the element's current position
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;

  // Set drag data
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        positionId: props.position?.id,
        offsetX: offsetX,
        offsetY: offsetY,
      }),
    );
  }

  // Emit unified drag start event
  if (props.player) {
    // Slot with player
    emit('dragstart', {
      player: props.player,
      positionId: props.position?.id,
      sourceType: 'field',
      isEmpty: false,
    });
  } else {
    // Empty slot
    emit('dragstart', {
      player: null,
      positionId: props.position?.id,
      sourceType: 'field',
      isEmpty: true,
    });
  }
};

const handleContainerDragEnd = () => {
  if (props.type !== 'field') return;

  emit('dragend');
};
</script>

<style lang="scss" scoped>
/* Enhanced drag visual feedback */
.cursor-grab:active {
  cursor: grabbing !important;
}

/* Drag ghost styling - makes the dragged element semi-transparent */
[draggable='true']:active {
  opacity: 0.8;
}

/* Add subtle glow effect during hover for field slots */
.absolute.hover\:scale-105:hover {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
  transform: translate(-50%, -50%) scale(1.05);
}

/* Ensure the entire slot container is interactive */
.absolute[draggable='true'] {
  user-select: none;
}
</style>
