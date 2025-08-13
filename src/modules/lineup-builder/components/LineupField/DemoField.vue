<template>
  <div>
    <!-- League indicator -->
    <div class="flex items-center justify-center mb-4">
      <div
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 border border-blue-500/20"
      >
        <q-icon
          :class="isKings ? 'text-yellow-400' : 'text-blue-400'"
          name="fa fa-crown"
          size="sm"
        />
        <span class="text-white font-semibold">
          {{ selectedLeague.label }}
        </span>
      </div>
    </div>

    <div class="relative h-96 rounded-xl overflow-hidden bg-gradient-to-b">
      <!-- Field markings -->
      <div ref="field" class="absolute inset-4 border-2 border-white/30 rounded-lg">
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
      <LineupPositionMini
        v-for="pos in fieldPositions"
        :key="pos.id"
        :field-position="pos"
        :position-dimension="positionDimension"
        :player="getFieldPosition(pos)"
        :is-kings="isKings"
        @drop="handleDrop"
        @remove="handleRemove"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import LineupPositionMini from 'src/modules/lineup-builder/components/LineupPosition';
import type { LeagueOption } from 'src/modules/home/components/HomeDemoBuilder';
import { LEAGUE_OPTION_DEFAULT as leagueOptionDefault } from 'src/modules/home/components/HomeDemoBuilder';
import { PlayerPositionAbbreviation } from 'src/modules/players/domain/value-objects/player-position.enum';
import type {
  FieldPosition,
  FieldPositions,
} from 'src/modules/lineup-builder/components/LineupField';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { PlayerPosition } from 'src/modules/players/domain/value-objects/player-position.enum';

interface Props {
  lineup: Record<string, PlayerDto>;
  fieldPositions: FieldPositions;
  selectedLeague: LeagueOption;
}

const props = withDefaults(defineProps<Props>(), {
  selectedLeague: () => leagueOptionDefault,
});

const emit = defineEmits(['dropPlayer', 'removePlayer']);

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

const maxPositionLengthInLine = computed(() => {
  const lines = [defensesPosition.value, midfieldersPosition.value, attackersPosition.value];

  return lines.reduce(
    (maxLine, currentLine) => (currentLine.length > maxLine.length ? currentLine : maxLine),
    [],
  );
});

const positionDimension = computed<number>(() => {
  const fieldHtml = field.value;
  const MAX_POSITION_WIDTH = 48;
  const MIN_POSITION_WIDTH = 36;

  if (!fieldHtml) {
    return MAX_POSITION_WIDTH;
  }

  const maxPlayersInLine = maxPositionLengthInLine.value.length;
  if (maxPlayersInLine <= 1) return MAX_POSITION_WIDTH;

  const calculatedWidth = fieldHtml.offsetWidth / maxPlayersInLine - 16;

  return Math.max(MIN_POSITION_WIDTH, Math.min(calculatedWidth, MAX_POSITION_WIDTH));
});

const getFieldPosition = (position: FieldPosition) => {
  return props.lineup[position.id] as PlayerDto;
};

const handleDrop = (positionId: string, position: PlayerPosition) => {
  emit('dropPlayer', positionId, position);
};

const handleRemove = (positionId: string) => {
  emit('removePlayer', positionId);
};
</script>
