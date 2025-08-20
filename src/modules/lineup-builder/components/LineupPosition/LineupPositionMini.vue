<template>
  <div
    :class="[
      'absolute transform -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 transition-all duration-200 p-2 w-auto md:min-w-24 cursor-pointer',
      player || selected ? 'border-solid bg-gray-900' : 'border-dashed bg-gray-800',
    ]"
    :style="{ left: `${fieldPosition.x}%`, top: `${fieldPosition.y}%` }"
    @dragover.prevent
    @drop="handleDrop"
    @click="handleClick"
  >
    <q-menu
      v-if="player"
      class="border border-slate-500 rounded-borders bg-gray-800"
      anchor="bottom right"
      self="bottom left"
      :offset="[5, 0]"
    >
      <q-list bordered dense separator>
        <!--        <q-item clickable>-->
        <!--          <q-item-section>Ver jugador</q-item-section>-->
        <!--        </q-item>-->
        <!--        <q-item clickable>-->
        <!--          <q-item-section>Mover jugador</q-item-section>-->
        <!--        </q-item>-->
        <q-item clickable @click="showSalaryDialog = true">
          <q-item-section>Editar salario</q-item-section>
        </q-item>
        <!--        <q-item clickable>-->
        <!--          <q-item-section>Editar rating</q-item-section>-->
        <!--        </q-item>-->
        <q-item clickable @click="removePlayer">
          <q-item-section>Quitar jugador</q-item-section>
        </q-item>
      </q-list>
    </q-menu>

    <!-- Player assigned to position -->
    <div v-if="player" class="w-full">
      <div
        :style="{ width: `${positionDimension}px`, height: `${positionDimension}px` }"
        :class="[
          'mx-auto rounded-full flex items-center justify-center cursor-pointer transition-transform border-2 shadow-md',
          isKings ? 'from-yellow-300 to-yellow-600' : 'from-blue-300 to-blue-600',
        ]"
      >
        <!--        <q-avatar v-if="player.profileImageUrl" size="40px" rounded>-->
        <!--          <q-img :style="{ backgroundImage: `url(${player.profileImageUrl})` }" />-->
        <!--        </q-avatar>-->
        <span class="text-xs font-bold text-white">{{ player.positionAbbreviation }}</span>
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

    <!-- Empty position slot -->
    <div v-else class="flex column items-center justify-center text-center">
      <div
        :style="{ width: `${positionDimension}px`, height: `${positionDimension}px` }"
        class="rounded-full border-2 border-dashed border-white/50 flex items-center justify-center text-center bg-black/10 transition-colors ease-in"
      >
        <q-icon class="text-slate-400" name="fas fa-plus" size="sm" />
      </div>
      <p class="hidden md:block text-xs font-medium text-slate-400 m-0 mt-1 p-0">
        {{ fieldPosition.abbreviation }}
      </p>
    </div>

    <player-edit-salary-dialog
      v-model="showSalaryDialog"
      :player="player"
      :formatter="formatter"
      @update:salary="emit('update:salary', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { PlayerEditSalaryDialog } from 'src/modules/players/dialogs/PlayerEditSalaryDialog';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { FieldPosition } from 'src/modules/lineup-builder/components/LineupField';

interface Props {
  fieldPosition: FieldPosition;
  positionDimension: number;
  player: PlayerDto | undefined;
  isKings: boolean;
  selected: boolean;
  formatter: (value: number) => string;
}

const props = defineProps<Props>();

const emit = defineEmits(['drop', 'remove', 'add', 'deselect', 'update:salary']);

const showSalaryDialog = ref(false);

const fullName = computed(() => `${props.player?.firstName} ${props.player?.lastName}`);
const displayName = computed(() =>
  fullName.value.length >= 14 ? props.player?.lastName : fullName.value,
);

const handleDrop = (e: Event) => {
  e.preventDefault();
  emit('drop', props.fieldPosition.id, props.fieldPosition.abbreviation);
};

const handleClick = (e: Event) => {
  e.preventDefault();
  if (props.player) return;
  if (props.selected) {
    emit('deselect', props.fieldPosition.id);
    return;
  }

  emit('add', props.fieldPosition.id, props.fieldPosition.abbreviation);
};

const removePlayer = (e: Event) => {
  e.preventDefault();
  emit('remove', props.fieldPosition.id);
};
</script>
