<template>
  <div>
    <div class="h-96 md:h-[500px] relative rounded-xl bg-gradient-to-b">
      <!-- Field markings -->
      <div
        ref="field"
        class="absolute top-0 left-0 right-0 bottom-0 bg-inset-4 border-2 border-white/30 rounded-lg"
      >
        <!-- Goal areas -->
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-8 border-2 border-white/30 border-t-0 rounded-b-lg"
        />
        <div
          class="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-8 border-2 border-white/30 border-b-0 rounded-t-lg"
        />

        <!-- Center line -->
        <div class="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30" />

        <!-- Center circle -->
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white/30 rounded-full"
        />
      </div>

      <!-- Player positions -->
      <player-slot
        v-for="pos in fieldPositions"
        :key="pos.id"
        type="field"
        :position="pos"
        :position-dimension="positionDimension"
        :player="lineup[pos.id]"
        :is-kings="isKings"
        :selected="pos.id === selectedSlot"
        :formatter="formatter"
        @remove="handleRemove"
        @add="handleFieldSlotClick"
        @deselect="handleFieldDeselect"
        @drop="handleFieldDrop"
        @update:salary="emit('update:salary', pos.id, 'field', $event)"
      />
    </div>

    <!-- Bench Section -->
    <div class="bg-slate-800/50 rounded-lg border border-blue-500/20 p-3 mt-4">
      <div class="flex items-center gap-2 mb-4">
        <h4 class="text-lg font-semibold text-white">Banquillo</h4>
        <q-badge
          :label="`${benchPlayersCount}/5`"
          :color="benchPlayersCount === 5 ? 'green' : 'blue'"
          outline
        />
      </div>

      <div class="grid grid-cols-5 gap-4">
        <player-slot
          v-for="(slot, index) in benchSlots"
          :key="`bench-${index}`"
          type="bench"
          :bench-slot="slot"
          :player="bench[slot.id]"
          :selected-league="selectedLeague"
          :field-positions="fieldPositions"
          :field-player="lineup"
          :is-kings="isKings"
          :selected="slot.id === selectedSlot"
          :position-dimension="positionDimension"
          :formatter="formatter"
          @remove="handleBenchRemove"
          @swap="handleSwapToField"
          @add="handleBenchSlotClick"
          @drop="handleBenchDrop"
          @deselect="handleBenchDeselect"
          @update:salary="emit('update:salary', slot.id, 'bench', $event)"
        />
      </div>

      <!-- Bench Actions -->
      <div
        class="flex items-center justify-center md:justify-between mt-4 pt-3 border-t border-slate-600/50"
      >
        <div class="text-sm text-gray-400 mb-2 md:mb-0">
          <span>Sustitutos disponibles: {{ benchPlayersCount }}/5</span>
        </div>

        <div class="flex gap-2">
          <q-btn
            size="sm"
            color="purple"
            outline
            @click="clearBench"
            :disable="benchPlayersCount === 0"
          >
            <q-icon name="fa fa-trash" size="xs" class="mr-1" />
            Limpiar banquillo
          </q-btn>

          <q-btn
            size="sm"
            color="blue"
            outline
            @click="autoFillBench"
            :disable="benchPlayersCount === 5"
          >
            <q-icon name="fa fa-wand-magic-sparkles" size="xs" class="mr-1" />
            Auto-completar
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Team Summary -->
    <div class="mt-4 bg-slate-800/50 rounded-lg border border-blue-500/20 p-3">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-white">{{ startingPlayersCount }}</div>
          <div class="text-xs text-gray-400">Titulares</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-purple-400">{{ benchPlayersCount }}</div>
          <div class="text-xs text-gray-400">Suplentes</div>
        </div>
        <div>
          <div
            class="text-2xl font-bold"
            :class="totalPlayersCount === 12 ? 'text-green-400' : 'text-yellow-400'"
          >
            {{ totalPlayersCount }}/12
          </div>
          <div class="text-xs text-gray-400">Total</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import { PlayerSlot } from 'src/modules/lineup-builder/components/PlayerSlot';
import { LEAGUE_OPTION_DEFAULT as leagueOptionDefault } from 'src/modules/home/components/HomeDemoBuilder';
import { PlayerPositionAbbreviation } from 'src/modules/players/domain/value-objects/player-position.enum';
import { BENCH_SLOTS as benchSlots } from './constants';
import type { LeagueOption } from 'src/modules/home/components/HomeDemoBuilder';
import type { FieldPositions } from 'src/modules/lineup-builder/components/LineupField';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

interface Props {
  lineup: Record<string, PlayerDto>;
  bench: Record<string, PlayerDto>;
  fieldPositions: FieldPositions;
  selectedLeague: LeagueOption;
  demoPlayers: PlayerDto[];
  selectedSlot: string | null;
  formatter: (value: number) => string;
}

const props = withDefaults(defineProps<Props>(), {
  selectedLeague: () => leagueOptionDefault,
});

const emit = defineEmits([
  'dropPlayer',
  'removePlayer',
  'dropBenchPlayer',
  'removeBenchPlayer',
  'swapPlayers',
  'autoFillBench',
  'clearBench',
  'clickFieldSlot',
  'clickBenchSlot',
  'deselectFieldSlot',
  'deselectBenchSlot',
  'dropFieldPlayer',
  'update:salary',
]);

const field = useTemplateRef('field');

const isKings = computed(() => props.selectedLeague.type === 'kings');

const defensesPosition = computed(() =>
  props.fieldPositions.filter((pos) => pos.abbreviation === PlayerPositionAbbreviation.DF),
);
const midfieldersPosition = computed(() =>
  props.fieldPositions.filter((pos) => pos.abbreviation === PlayerPositionAbbreviation.MC),
);
const attackersPosition = computed(() =>
  props.fieldPositions.filter((pos) => pos.abbreviation === PlayerPositionAbbreviation.DC),
);

const startingPlayersCount = computed(() => {
  return Object.values(props.lineup).filter((player) => player !== null && player !== undefined)
    .length;
});

const benchPlayersCount = computed(() => {
  return Object.values(props.bench).filter((player) => player !== null && player !== undefined)
    .length;
});

const totalPlayersCount = computed(() => {
  return startingPlayersCount.value + benchPlayersCount.value;
});

const maxPositionLengthInLine = computed(() => {
  const lines = [defensesPosition.value, midfieldersPosition.value, attackersPosition.value];

  return lines.reduce(
    (maxLine, currentLine) => (currentLine.length > maxLine.length ? currentLine : maxLine),
    [],
  );
});

const positionDimension = computed<number>(() => {
  const fieldHtml = field.value;
  const MAX_POSITION_WIDTH = 72;
  const MIN_POSITION_WIDTH = 36;

  if (!fieldHtml) {
    return MAX_POSITION_WIDTH;
  }

  const maxPlayersInLine = maxPositionLengthInLine.value.length;
  if (maxPlayersInLine <= 1) return MAX_POSITION_WIDTH;

  const calculatedWidth = fieldHtml.offsetWidth / maxPlayersInLine - 16;

  return Math.max(MIN_POSITION_WIDTH, Math.min(calculatedWidth, MAX_POSITION_WIDTH));
});

// Methods
const handleFieldDrop = (positionId: string, position: PlayerPositionAbbreviation) => {
  emit('dropFieldPlayer', positionId, position);
};

const handleBenchDrop = (slotId: string) => {
  emit('dropBenchPlayer', slotId);
};

const handleFieldDeselect = (positionId: string) => {
  emit('deselectFieldSlot', positionId);
};

const handleBenchDeselect = (slotId: string) => {
  emit('deselectBenchSlot', slotId);
};

const handleFieldSlotClick = (positionId: string, position: PlayerPositionAbbreviation) => {
  emit('clickFieldSlot', positionId, position);
};

const handleBenchSlotClick = (slotId: string) => {
  emit('clickBenchSlot', slotId);
};

const handleRemove = (positionId: string) => {
  emit('removePlayer', positionId);
};

const handleBenchRemove = (slotId: string) => {
  emit('removeBenchPlayer', slotId);
};

const handleSwapToField = (benchSlotId: string, fieldPositionId: string) => {
  emit('swapPlayers', benchSlotId, fieldPositionId);
};

const clearBench = () => {
  emit('clearBench');
};

const autoFillBench = () => {
  emit('autoFillBench');
};
</script>
