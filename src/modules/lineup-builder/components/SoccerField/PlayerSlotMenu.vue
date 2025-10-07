<template>
  <q-menu
    context-menu
    :disable="disabled"
    transition-show="jump-down"
    transition-hide="jump-up"
    class="player-slot-menu"
  >
    <q-list dense class="min-w-[150px] text-xs">
      <!-- Ver detalles -->
      <q-item v-close-popup clickable @click="emit('view-details')">
        <q-item-section avatar class="items-center">
          <q-icon name="la la-user" size="xs" color="dark" />
        </q-item-section>
        <q-item-section>Ver información</q-item-section>
      </q-item>

      <!-- Editar valor -->
      <q-item v-close-popup clickable @click="emit('edit-value')">
        <q-item-section avatar class="items-center">
          <q-icon name="la la-edit" size="xs" color="dark" />
        </q-item-section>
        <q-item-section>Editar</q-item-section>
      </q-item>

      <q-separator />

      <!-- Cambiar jugador -->
      <q-item v-close-popup clickable @click="emit('swap-player')">
        <q-item-section avatar class="items-center">
          <q-icon name="la la-exchange-alt" size="xs" color="dark" />
        </q-item-section>
        <q-item-section>Cambiar jugador</q-item-section>
      </q-item>

      <!-- Mover a campo (solo si está en banca) -->
      <q-item v-if="isBench" v-close-popup clickable @click="emit('move-to-field')">
        <q-item-section avatar class="items-center">
          <q-icon name="la la-arrow-up" size="xs" color="dark" />
        </q-item-section>
        <q-item-section>Mover al campo</q-item-section>
      </q-item>

      <!-- Mover a banca (solo si está en campo) -->
      <q-item v-if="!isBench" v-close-popup clickable @click="emit('move-to-bench')">
        <q-item-section avatar class="items-center">
          <q-icon name="la la-arrow-down" size="xs" color="dark" />
        </q-item-section>
        <q-item-section>Mover a la banca</q-item-section>
      </q-item>

      <q-separator />

      <!-- Quitar de alineación -->
      <q-item v-close-popup clickable @click="emit('remove-player')">
        <q-item-section avatar class="items-center">
          <q-icon name="la la-trash" size="xs" color="red" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-red">Quitar</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
// ==================== TYPES ====================
interface Props {
  isBench: boolean;
  modelValue?: boolean;
  disabled?: boolean;
}

// ==================== PROPS & EMITS ====================

withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
});

const emit = defineEmits<{
  'view-details': [];
  'edit-value': [];
  'swap-player': [];
  'move-to-field': [];
  'move-to-bench': [];
  'remove-player': [];
  'update:modelValue': [value: boolean];
}>();
</script>
