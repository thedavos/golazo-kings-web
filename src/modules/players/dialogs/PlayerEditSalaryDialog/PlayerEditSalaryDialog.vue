<template>
  <q-dialog
    :model-value="modelValue"
    seamless
    transition-show="slide-up"
    transition-hide="slide-down"
    @keydown.esc="emit('update:model-value', false)"
    @update:model-value="emit('update:model-value', $event)"
  >
    <q-card class="bg-slate-800 text-white min-w-[300px]">
      <q-card-section class="pb-2">
        <div class="text-h6 flex justify-between items-center gap-2">
          <span>Editar salario</span>
          <q-btn
            flat
            round
            dense
            icon="fa fa-close"
            size="sm"
            color="white"
            class="bg-gray-500/20 hover:bg-gray-500/30"
            @click="emit('update:model-value', false)"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <div class="mb-3">
          <q-input
            v-model.number="playerSalary"
            name="updateSalary"
            hide-bottom-space
            outlined
            dense
            step="100"
            type="number"
            color="blue"
            bg-color="slate-700"
            class="text-white flex-1"
            input-class="text-white"
          />
          <div class="mt-1 text-xs text-gray-400">Salario: {{ formatter(playerSalary) }}</div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Actualizar" @click="updatePlayerSalary" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

interface Props {
  modelValue: boolean;
  player: PlayerDto | undefined;
  formatter: (amount: number) => string;
}

defineProps<Props>();

const emit = defineEmits(['update:salary', 'update:model-value']);

const playerSalary = ref(100);

// Methods
const updatePlayerSalary = () => {
  emit('update:model-value', false);
  emit('update:salary', playerSalary.value);
};
</script>
