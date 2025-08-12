<template>
  <section class="relative q-py-xl overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0">
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        :style="{ backgroundImage: `url(${heroBackground})` }"
      />
      <div
        class="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary/80 to-bg-tertiary"
      />
    </div>

    <!-- Content -->
    <div class="relative z-10 container q-mx-auto q-px-md text-center">
      <div class="hero-content q-mx-auto">
        <!-- Headline -->
        <div class="flex items-center justify-center gap-4 mb-6">
          <q-icon name="fas fa-crown" size="4rem" class="text-go-gold animate-premium-pulse" />
          <h1 class="text-6xl lg:text-7xl font-bold font-inter text-gradient-go">GolazoKings</h1>
          <q-icon name="fas fa-crown" size="4rem" class="text-go-gold animate-premium-pulse" />
        </div>

        <h2 class="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Crea tu alineación perfecta de
          <span class="text-gradient-go">Kings League</span>
        </h2>

        <p class="text-xl lg:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
          Gestiona salarios, compara jugadores y exporta tus lineups como un pro
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <q-btn class="bg-primary font-bold text-white rounded-lg" @click="onBuildSquad">
            <q-icon name="fas fa-trophy" size="16px" class="mr-2" />
            Crear mi primera alineación
          </q-btn>

          <q-btn
            outline
            class="bg-secondary text-white font-semibold rounded-lg"
            @click="onExplorePlayers"
          >
            <q-icon name="fas fa-users" size="16px" class="mr-2" />
            Ver jugadores disponibles
          </q-btn>
        </div>
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
              EA
            </div>
            <div
              class="absolute top-20 left-1/2 -translate-x-1/2 w-8 h-8 bg-go-blue rounded-full flex items-center justify-center text-xs font-bold text-white shadow-glow-go-blue"
            >
              NS
            </div>
            <div
              class="absolute top-16 left-6 w-8 h-8 bg-go-green rounded-full flex items-center justify-center text-xs font-bold text-white shadow-glow-green"
            >
              MP
            </div>
            <div
              class="absolute top-16 right-6 w-8 h-8 bg-go-green rounded-full flex items-center justify-center text-xs font-bold text-white shadow-glow-green"
            >
              GV
            </div>
            <div
              class="absolute bottom-16 left-1/3 w-8 h-8 bg-go-purple rounded-full flex items-center justify-center text-xs font-bold text-white shadow-glow-purple"
            >
              AG
            </div>
            <div
              class="absolute bottom-16 right-1/3 w-8 h-8 bg-go-purple rounded-full flex items-center justify-center text-xs font-bold text-white shadow-glow-purple"
            >
              DS
            </div>
            <div
              class="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-go-gold rounded-full flex items-center justify-center text-xs font-bold text-black shadow-glow-gold"
            >
              VV
            </div>
          </div>

          <p class="text-sm text-muted-foreground mt-4">Formación 2-3-1 con jugadores estrella</p>
        </div>
      </div>
    </div>

    <!-- Floating particles -->
    <div class="absolute inset-0 pointer-events-none">
      <div
        v-for="i in 6"
        :key="i"
        class="w-1 h-1 bg-go-gold rounded-full absolute animate-float-particle"
        :style="getParticleStyle(i)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import heroBackground from 'src/assets/home/hero-background-B1OqpS2R.jpg';

interface Props {
  onExplorePlayers?: () => void;
  onBuildSquad?: () => void;
}

withDefaults(defineProps<Props>(), {
  onExplorePlayers: () => {},
  onBuildSquad: () => {},
});

const getParticleStyle = (index: number) => ({
  left: `${15 + (index - 1) * 15}%`,
  top: `${30 + ((index - 1) % 2) * 40}%`,
  width: '4px',
  height: '4px',
  animationDelay: `${(index - 1) * 2}s`,
  animationDuration: '8s',
});
</script>
