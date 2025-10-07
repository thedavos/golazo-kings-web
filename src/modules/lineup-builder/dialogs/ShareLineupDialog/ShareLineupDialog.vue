<template>
  <q-dialog
    ref="dialogRef"
    transition-show="jump-up"
    transition-hide="jump-down"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin w-[600px] max-w-[90vw]">
      <go-toolbar-header title="Comparte tu alineación" />

      <q-card-section>
        <!-- 1. Vista Previa -->
        <div class="lineup-preview-placeholder my-4">
          <q-icon name="la la-futbol" size="xl" color="grey-5" />
          <div class="text-grey-7">Aquí va una vista previa visual de la alineación</div>
        </div>

        <div>
          <!-- 2. Descargar como Imagen -->
          <q-btn
            no-caps
            flat
            dense
            size="sm"
            class="block"
            color="primary"
            icon="la la-download"
            label="Descargar como Imagen (PNG)"
            @click="downloadAsImage"
          />

          <!-- 3. Copiar Enlace -->
          <q-btn
            no-caps
            flat
            dense
            size="sm"
            class="block mt-1"
            color="primary"
            icon="la la-link"
            label="Copiar Enlace"
            @click="copyLink"
          />

          <!-- 4. Atajos Sociales -->
          <div class="column items-center mt-2">
            <div class="font-medium text-xs text-gray-400 mb-2">Comparte en:</div>
            <div class="row q-gutter-sm">
              <q-btn
                fab-mini
                icon="lab la-twitter"
                style="color: #1da1f2"
                @click="share('twitter')"
              />
              <q-btn
                fab-mini
                icon="lab la-whatsapp"
                style="color: #25d366"
                @click="share('whatsapp')"
              />
              <q-btn
                fab-mini
                icon="lab la-facebook-f"
                style="color: #1877f2"
                @click="share('facebook')"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';
import { GoToolbarHeader } from 'src/modules/shared/components/GoToolbarHeader';
import { useLineupFeedback } from 'src/modules/lineup-builder/composables';
import { useFeedback } from 'src/modules/shared/composables';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide } = useDialogPluginComponent();
const lineupFeedback = useLineupFeedback();
const feedback = useFeedback();

// --- Lógica de Acciones (Implementación simulada) ---

const downloadAsImage = () => {
  // Aquí iría la lógica para convertir el div de la alineación en una imagen (ej. usando html2canvas)
  feedback.info({
    message: 'Función "Descargar" no implementada aún.',
    icon: 'la la-code',
  });
};

const copyLink = () => {
  // Aquí iría la lógica para generar y copiar el enlace único de la alineación
  navigator.clipboard
    .writeText(window.location.href)
    .then(() => {
      lineupFeedback.shareSuccess();
    })
    .catch(() => {
      lineupFeedback.shareError();
    });
};

const share = (platform: 'twitter' | 'whatsapp' | 'facebook') => {
  // Lógica para compartir en redes sociales usando sus APIs o URLs de share
  feedback.info({
    message: `Compartiendo en ${platform}... (simulado)`,
    icon: 'la la-share-alt',
  });
};
</script>

<style lang="scss" scoped>
.lineup-preview-placeholder {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
</style>
