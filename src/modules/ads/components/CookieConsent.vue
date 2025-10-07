<template>
  <transition
    appear
    enter-active-class="animated slideInUp"
    leave-active-class="animated slideOutDown"
  >
    <div
      v-if="!hasUserConsent"
      class="fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-gray-900 backdrop-blur-lg border-t-2 border-primary shadow-[0_-4px_20px_rgba(0,0,0,0.15)] p-6 sm:p-8 max-h-[50vh] overflow-y-auto"
    >
      <div class="mx-auto text-gray-900 dark:text-white">
        <!-- Icono y título -->
        <div class="flex items-center gap-3 mb-4">
          <q-icon name="la la-cookie-bite" size="32px" class="text-primary" />
          <h3 class="text-xl sm:text-2xl font-bold m-0 text-gray-900 dark:text-white">Usamos cookies</h3>
        </div>

        <!-- Descripción -->
        <p class="text-sm sm:text-base leading-relaxed mb-5 text-gray-700 dark:text-white/90 m-0">
          Utilizamos cookies y tecnologías similares para mejorar tu experiencia, personalizar
          contenido y mostrar anuncios relevantes. Al hacer clic en "Aceptar todas", aceptas nuestro
          uso de cookies.
        </p>

        <!-- Botones de acción -->
        <div class="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
          <q-btn
            unelevated
            color="primary"
            label="Aceptar todas"
            class="flex-1 min-w-[140px] font-semibold normal-case px-5 py-2.5"
            @click="handleAcceptAll"
          />
          <q-btn
            outline
            color="primary"
            label="Solo necesarias"
            class="flex-1 min-w-[140px] font-semibold normal-case px-5 py-2.5"
            @click="handleNecessaryOnly"
          />
          <q-btn
            flat
            color="grey-7"
            label="Rechazar"
            class="flex-1 min-w-[140px] font-semibold normal-case px-5 py-2.5 !text-gray-600 dark:!text-white/70"
            @click="handleReject"
          />
        </div>

        <!-- Link a política de privacidad -->
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2 text-sm text-gray-600 dark:text-white/60 mt-3"
        >
          <a
            href="/privacy"
            class="text-primary no-underline transition-colors hover:underline"
            target="_blank"
          >
            Política de Privacidad
          </a>
          <span class="hidden sm:inline text-gray-400 dark:text-white/30">•</span>
          <button
            class="bg-transparent border-0 text-primary cursor-pointer p-0 text-sm transition-colors hover:underline"
            @click="toggleDetails"
          >
            {{ showDetails ? 'Menos detalles' : 'Más detalles' }}
          </button>
        </div>

        <!-- Detalles expandibles -->
        <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
          <div v-if="showDetails" class="mt-5 pt-5 border-t border-gray-200 dark:border-white/10">
            <div class="mb-4">
              <h4 class="text-base font-semibold mb-2 m-0 text-gray-900 dark:text-white">🎯 Cookies de publicidad</h4>
              <p class="text-sm leading-relaxed m-0 text-gray-700 dark:text-white/80">
                Permiten mostrar anuncios personalizados según tus intereses. Estas cookies rastrean
                tu navegación para ofrecerte contenido relevante.
              </p>
            </div>
            <div class="mb-4">
              <h4 class="text-base font-semibold mb-2 m-0 text-gray-900 dark:text-white">📊 Cookies analíticas</h4>
              <p class="text-sm leading-relaxed m-0 text-gray-700 dark:text-white/80">
                Nos ayudan a entender cómo usas la aplicación para mejorar tu experiencia.
                Recopilamos datos anónimos sobre tu interacción.
              </p>
            </div>
            <div class="mb-4">
              <h4 class="text-base font-semibold mb-2 m-0 text-gray-900 dark:text-white">✅ Cookies necesarias</h4>
              <p class="text-sm leading-relaxed m-0 text-gray-700 dark:text-white/80">
                Esenciales para el funcionamiento básico del sitio. No se pueden desactivar y no
                rastrean información personal.
              </p>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGoogleConsent } from '../composables/useGoogleConsent';

const { 
  hasUserConsent, 
  acceptAllConsent, 
  denyAllConsent, 
  acceptNecessaryOnly
} = useGoogleConsent();

const showDetails = ref(false);

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

const handleAcceptAll = () => {
  acceptAllConsent();
};

const handleNecessaryOnly = () => {
  acceptNecessaryOnly();
};

const handleReject = () => {
  denyAllConsent();
};
</script>
