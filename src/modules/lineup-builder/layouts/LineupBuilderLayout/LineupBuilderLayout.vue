<script setup lang="ts">
// Layout component with slots - no content, only grid structure
</script>

<template>
  <div class="lineup-builder-layout">
    <!-- EL TOPBAR INTELIGENTE -->
    <div class="topbar">
      <slot name="topbar" />
    </div>

    <!-- Main Content Grid -->
    <main class="main-content">
      <!-- ÁREA PRINCIPAL (El Lienzo de Creación) -->
      <section class="main-area">
        <slot name="main-area" />
      </section>

      <!-- BARRA LATERAL (El Catálogo Contextual) -->
      <aside class="sidebar">
        <slot name="sidebar" />
      </aside>
    </main>

    <!-- EL BANNER INFERIOR (Monetización Respetuosa) -->
    <div class="bottom-banner">
      <slot name="bottom-banner" />
    </div>
  </div>
</template>

<style scoped>
.lineup-builder-layout {
  display: grid;
  grid-template-areas:
    'topbar'
    'main-content'
    'bottom-banner';
  grid-template-rows: auto 1fr auto;
  min-height: calc(100vh - 50px) !important;
  font-family: var(--font-family-manrope), sans-serif;
}

.topbar {
  grid-area: topbar;
}

.main-content {
  grid-area: main-content;
  display: grid;
  grid-template-areas: 'main-area sidebar';
  grid-template-columns: 1fr 400px;
}

.main-area {
  grid-area: main-area;
}

.sidebar {
  grid-area: sidebar;
}

.bottom-banner {
  grid-area: bottom-banner;
}

/* Responsive Design */
/*@media (max-width: 1024px) {
  .main-content {
    grid-template-areas:
      'main-area'
      'sidebar';
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}*/
</style>
