<script setup lang="ts">
// LineupToolbar component with CSS Grid layout for 3 equal sections
</script>

<template>
  <div class="lineup-toolbar">
    <!-- Left Section -->
    <div class="toolbar-section left-section">
      <slot name="left" />
    </div>

    <!-- Center Section -->
    <div class="toolbar-section center-section">
      <slot name="center" />
    </div>

    <!-- Right Section -->
    <div class="toolbar-section right-section">
      <slot name="right" />
    </div>
  </div>
</template>

<style scoped>
.lineup-toolbar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas: 'left center right';
  gap: 1rem;
  padding: 1rem;
  min-height: 4rem;
}

.toolbar-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease-in-out;
}

.left-section {
  grid-area: left;
  justify-content: flex-start;
}

.center-section {
  grid-area: center;
  justify-content: center;
}

.right-section {
  grid-area: right;
  justify-content: flex-end;
}

/* Responsive Design */
@media (max-width: 768px) {
  .lineup-toolbar {
    grid-template-columns: 1fr;
    grid-template-areas:
      'center'
      'right'
      'left';
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .toolbar-section {
    justify-content: center;
    min-height: 3rem;
  }

  .left-section,
  .right-section {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .lineup-toolbar {
    padding: 0.5rem;
    gap: 0.25rem;
  }

  .toolbar-section {
    padding: 0.25rem;
    min-height: 2.5rem;
  }
}
</style>
