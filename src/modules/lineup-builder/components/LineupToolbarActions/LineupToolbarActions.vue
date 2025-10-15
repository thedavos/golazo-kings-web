<template>
  <div class="flex items-center gap-1.5">
    <q-btn flat round icon="la la-cog" color="dark" @click="settings">
      <q-tooltip :delay="500">Configuración</q-tooltip>
    </q-btn>
    <q-btn flat round icon="la la-question-circle" color="dark" @click="help">
      <q-menu
        fit
        auto-close
        anchor="bottom middle"
        self="top middle"
        transition-show="jump-up"
        :offset="[0, 8]"
      >
        <q-list separator dense>
          <q-item clickable disable v-close-popup @click="discover">
            <q-item-section>Descubre la App</q-item-section>
          </q-item>
          <q-item clickable disable v-close-popup @click="quickStart">
            <q-item-section>Guía Rápida</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="support">
            <q-item-section>Apoya este Proyecto</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="feedback">
            <q-item-section>Envíanos tu feedback</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
    <q-btn
      flat
      rounded
      no-caps
      dense
      disable
      size="md"
      label="Compartir"
      icon="la la-share"
      color="dark"
      @click="share"
    />
    <q-btn v-bind="saveProperties" @click="save" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';

type SaveState = 'idle' | 'saving' | 'saved';

const emit = defineEmits([
  'save',
  'share',
  'settings',
  'help',
  'discover',
  'support',
  'feedback',
  'quick-start',
]);

const $q = useQuasar();
const saveState = ref<SaveState>('idle');

const saveProperties = computed(() => {
  const common = {
    color: 'primary',
    size: 'md',
    dense: true,
    unelevated: true,
    noCaps: true,
    loading: saveState.value === 'saving',
    disable: saveState.value !== 'idle',
  };

  // Configuración según el estado
  let icon = 'la la-save';
  let label = 'Guardar';

  if (saveState.value === 'saving') {
    label = 'Guardando...';
  } else if (saveState.value === 'saved') {
    icon = 'la la-check';
    label = 'Guardado';
  }

  if ($q.screen.lt.md) {
    return {
      ...common,
      icon,
      label: '',
      flat: false,
      round: true,
    };
  }

  return {
    ...common,
    icon,
    label,
  };
});

const save = () => {
  if (saveState.value !== 'idle') return;

  // Cambiar a estado "saving"
  saveState.value = 'saving';

  try {
    // Emitir el evento y esperar a que se complete
    emit('save');

    // Cambiar a estado "saved"
    saveState.value = 'saved';

    // Después de 1.5 segundos, volver al estado inicial
    setTimeout(() => {
      saveState.value = 'idle';
    }, 1500);
  } catch (error) {
    console.error('Error al guardar:', error);
    saveState.value = 'idle';
  }
};

const share = () => {
  emit('share');
};

const settings = () => {
  emit('settings');
};

const help = () => {
  emit('help');
};

const discover = () => {
  emit('discover');
};

const support = () => {
  emit('support');
};

const feedback = () => {
  emit('feedback');
};

const quickStart = () => {
  emit('quick-start');
};
</script>
