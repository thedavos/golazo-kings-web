<template>
  <section
    class="relative pt-[192px] md:pt-[8px] overflow-hidden top-[-125px] h-[calc(100vh+66px)] md:h-[calc(100vh+1px)]"
  >
    <!-- Background -->
    <div class="absolute inset-0">
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        :style="{ backgroundImage: `url(${heroBackground})` }"
      />
      <div
        class="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary/80 to-bg-tertiary"
      />
    </div>

    <!-- Content -->
    <div class="container relative z-10 mx-auto px-6 text-center h-full place-content-center">
      <div class="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 q-mx-auto">
        <div class="grid-cols-1">
          <!-- Headline -->
          <h2
            class="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight text-center md:text-left"
          >
            Crea tu alineación perfecta de
            <span class="text-gradient-go">Kings League</span>
          </h2>

          <p
            class="text-lg lg:text-xl text-white mb-10 max-w-4xl mx-auto leading-relaxed text-center md:text-left"
          >
            Gestiona salarios, compara jugadores y exporta tus lineups como un pro
          </p>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row gap-4 justify-start items-center">
            <q-btn class="bg-primary font-bold text-white rounded-lg" @click="onBuildSquad">
              <q-icon name="fas fa-trophy" size="16px" class="mr-2" />
              Crear mi primera alineación
            </q-btn>

            <q-btn
              outline
              class="bg-transparent text-white font-semibold rounded-lg"
              @click="onExplorePlayers"
            >
              <q-icon name="fas fa-users" size="16px" class="mr-2" />
              Ver jugadores disponibles
            </q-btn>
          </div>
        </div>
        <div class="hidden md:block">
          <div class="mt-16">
            <div
              class="w-80 h-60 mx-auto bg-gradient-field rounded-field border-2 border-white/20 relative overflow-hidden animate-field-glow"
            >
              <!-- Field markings -->
              <div class="absolute inset-2 border border-white/30 rounded-lg">
                <div
                  class="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-6 border border-white/30 border-t-0 rounded-b"
                />
                <div
                  class="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-6 border border-white/30 border-b-0 rounded-t"
                />
                <div class="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
                <div
                  class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-white/30 rounded-full"
                />
              </div>

              <!-- Sample players -->
              <div
                class="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-go-blue rounded-full flex items-center justify-center text-xs font-bold text-white shadow-glow-go-blue"
              >
                DC
              </div>
              <div
                class="absolute top-20 left-1/2 -translate-x-1/2 w-8 h-8 bg-go-blue rounded-full flex items-center justify-center text-xs font-bold text-white shadow-glow-go-blue"
              >
                MC
              </div>
              <div
                class="absolute top-16 left-6 w-8 h-8 bg-go-green rounded-full flex items-center justify-center text-xs font-bold text-white shadow-glow-green"
              >
                MI
              </div>
              <div
                class="absolute top-16 right-6 w-8 h-8 bg-go-green rounded-full flex items-center justify-center text-xs font-bold text-white shadow-glow-green"
              >
                MD
              </div>
              <div
                class="absolute bottom-16 left-1/3 w-8 h-8 bg-go-purple rounded-full flex items-center justify-center text-xs font-bold text-white shadow-glow-purple"
              >
                DF
              </div>
              <div
                class="absolute bottom-16 right-1/3 w-8 h-8 bg-go-purple rounded-full flex items-center justify-center text-xs font-bold text-white shadow-glow-purple"
              >
                DF
              </div>
              <div
                class="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-go-gold rounded-full flex items-center justify-center text-xs font-bold text-black shadow-glow-gold"
              >
                PO
              </div>
            </div>

            <p class="text-sm text-muted-foreground mt-4">Formación 2-3-1 con jugadores estrella</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating particles -->
    <background-particles
      class="absolute inset-0 pointer-events-none"
      :quantity="30"
      :ease="100"
      :color="'#F59E0B'"
      :staticity="5"
      refresh
    />
  </section>
</template>

<script setup lang="ts">
import BackgroundParticles from 'src/modules/shared/backgrounds/BackgroundParticles.vue';
import heroBackground from 'src/assets/home/hero-background-B1OqpS2R.jpg';

interface Props {
  onExplorePlayers?: () => void;
  onBuildSquad?: () => void;
}

withDefaults(defineProps<Props>(), {
  onExplorePlayers: () => {},
  onBuildSquad: () => {},
});
</script>
