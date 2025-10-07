<template>
  <div ref="containerRef" class="soccer-field-container relative w-full h-full overflow-hidden">
    <!-- Botón de reinicio en esquina superior derecha -->
    <div class="absolute top-4 right-4 z-50">
      <q-btn
        @click="handleResetLineup"
        round
        push
        icon="las la-redo-alt"
        size="sm"
        class="bg-Extended-Banner text-white shadow-lg"
      >
        <q-tooltip>Reiniciar campo y banquillo</q-tooltip>
      </q-btn>
    </div>

    <!-- Canvas del campo (inclinado) -->
    <canvas ref="canvasFieldRef" :class="['soccer-field-canvas', { 'effect-3d': enable3d }]" />

    <!-- Capa para jugadores -->
    <div class="soccer-players-layer absolute inset-0">
      <!-- Jugadores en el campo usando componentes -->
      <player-slot
        v-for="slot in fieldPlayersInSlots"
        :key="slot.id"
        :player-slot="slot"
        :player="lineupStore.getLineupPlayerById(slot.playerId)"
        :container-width="canvasWidth"
        :container-height="canvasHeight"
        :field-area="fieldArea"
        :is-dragging="isDragging"
        @player-click="onPlayerClick"
        @view-details="onViewPlayerDetails"
        @edit-value="onEditPlayerValue"
        @swap-player="onSwapPlayer"
        @move-to-bench="onMovePlayerToBench"
        @remove-player="onRemovePlayer"
        @mousedown="(e: MouseEvent) => onPlayerMouseDown(e, slot.id)"
      />
    </div>

    <!-- Componentes Vue sobrepuestos -->
    <team-slot v-if="showTeamInLineup && team" :team="team" />
    <coach-slot v-if="showCoachInLineup && coach" :coach="coach" />
    <bench-slot
      :bench-slot-players="benchPlayersInSlots"
      @player-click="(id) => emit('playerClick', id)"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useResizeObserver, useEventListener } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import TeamSlot from './TeamSlot.vue';
import CoachSlot from './CoachSlot.vue';
import BenchSlot from './BenchSlot.vue';
import PlayerSlot from './PlayerSlot.vue';
import { useLineupStore } from 'stores/useLineupStore';
import { useLineupDialogs } from 'src/modules/lineup-builder/composables/useLineupDialogs';
import { useLineupFeedback } from 'src/modules/lineup-builder/composables/useLineupFeedback';
import fieldImage from 'src/assets/field/field-lineup.jpg';
import {
  handleSwapPlayer,
  handleViewPlayerDetails,
  handleEditPlayerValue,
  handleMovePlayerToBench,
  handleRemovePlayer,
} from 'src/modules/lineup-builder/helpers';

// ==================== TYPES ====================

interface TeamSlot {
  name: string;
  logo?: string;
}

interface CoachSlot {
  name: string;
  image?: string;
}

interface Props {
  formation?: string;
  enable3d?: boolean;
  team?: TeamSlot;
  coach?: CoachSlot;
}

// ==================== PROPS & EMITS ====================

withDefaults(defineProps<Props>(), {
  formation: '4-3-3',
  enable3d: true,
  team: () => ({ name: 'Mi Equipo' }),
  coach: () => ({ name: 'Entrenador' }),
});

const emit = defineEmits<{
  playerClick: [playerId: string];
  playerMove: [playerId: string, x: number, y: number];
}>();

// Store flags for showing team and coach on field
const lineupStore = useLineupStore();
const {
  showTeamInLineup,
  showCoachInLineup,
  fieldPlayersInSlots,
  benchPlayersInSlots,
  allPlayersInSlots,
} = storeToRefs(lineupStore);

// Composables
const lineupDialogs = useLineupDialogs();
const lineupFeedback = useLineupFeedback();

// ==================== REFS ====================

// Canvas refs
const containerRef = ref<HTMLDivElement | null>(null);
const canvasFieldRef = ref<HTMLCanvasElement | null>(null);
const ctxField = ref<CanvasRenderingContext2D | null>(null);

// Image refs
const fieldImg = ref<HTMLImageElement | null>(null);
const isImageLoaded = ref(false);

// Drag state
const isDragging = ref(false);
const draggedPlayerId = ref<string | null>(null);
const dragStartPos = ref({ x: 0, y: 0 });
const dragOffset = ref({ x: 0, y: 0 });

// Canvas dimensions
const canvasWidth = ref(800);
const canvasHeight = ref(1200);

// Field area (área real del campo dentro del canvas)
const fieldArea = ref({
  offsetX: 0,
  offsetY: 0,
  width: 800,
  height: 1200,
});

// ==================== IMAGE LOADING ====================

/**
 * Carga una imagen genérica
 */
const loadImage = (src: string, crossOrigin = false): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  });
};

/**
 * Carga la imagen del campo
 */
const loadFieldImage = async (): Promise<void> => {
  try {
    const img = await loadImage(fieldImage);
    fieldImg.value = img;
    isImageLoaded.value = true;
    console.log('✅ Campo de fútbol cargado:', img.width, 'x', img.height);
  } catch (error) {
    console.error('❌ Error cargando imagen del campo:', error);
    throw error;
  }
};

// ==================== CANVAS INITIALIZATION ====================

/**
 * Inicializa el canvas del campo
 */
const initCanvas = () => {
  if (!canvasFieldRef.value) return;

  // Canvas del campo
  const contextField = canvasFieldRef.value.getContext('2d');
  if (!contextField) {
    console.error('❌ No se pudo obtener el contexto 2D del canvas del campo');
    return;
  }
  ctxField.value = contextField;

  // Configurar el tamaño del canvas
  resizeCanvas();

  console.log('✅ Canvas del campo inicializado');
};

/**
 * Redimensiona el canvas según el contenedor
 */
const resizeCanvas = () => {
  if (!canvasFieldRef.value || !containerRef.value) return;

  const container = containerRef.value;
  const rect = container.getBoundingClientRect();

  // Establecer el tamaño del canvas
  canvasWidth.value = rect.width;
  canvasHeight.value = rect.height;

  canvasFieldRef.value.width = canvasWidth.value;
  canvasFieldRef.value.height = canvasHeight.value;

  // Redibujar el campo después de redimensionar
  drawField();
};

// ==================== DRAWING FUNCTIONS ====================

/**
 * Dibuja el campo de fútbol (solo la imagen del campo)
 */
const drawField = () => {
  if (!ctxField.value || !canvasFieldRef.value) return;

  const canvas = canvasFieldRef.value;
  const context = ctxField.value;

  // Limpiar el canvas del campo
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar la imagen del campo (siempre)
  if (isImageLoaded.value && fieldImg.value) {
    const imgAspectRatio = fieldImg.value.width / fieldImg.value.height;
    const canvasAspectRatio = canvas.width / canvas.height;

    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgAspectRatio > canvasAspectRatio) {
      drawWidth = canvas.width;
      drawHeight = drawWidth / imgAspectRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawHeight = canvas.height;
      drawWidth = drawHeight * imgAspectRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    }

    context.drawImage(fieldImg.value, offsetX, offsetY, drawWidth, drawHeight);

    // Actualizar el área real del campo para los jugadores
    fieldArea.value = {
      offsetX,
      offsetY,
      width: drawWidth,
      height: drawHeight,
    };
  } else {
    // Fondo temporal mientras carga la imagen
    context.fillStyle = '#2d5a2e';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#ffffff';
    context.font = '20px sans-serif';
    context.textAlign = 'center';
    context.fillText('Cargando campo...', canvas.width / 2, canvas.height / 2);

    // Campo ocupa todo el canvas cuando no hay imagen
    fieldArea.value = {
      offsetX: 0,
      offsetY: 0,
      width: canvas.width,
      height: canvas.height,
    };
  }
};
// ==================== MOUSE EVENTS ====================

/**
 * Maneja el click en un jugador
 */
const onPlayerClick = (playerId: string) => {
  if (!isDragging.value) {
    emit('playerClick', playerId);
  }
};

/**
 * Inicia el arrastre de un jugador
 */
const onPlayerMouseDown = (event: MouseEvent, slotId: string) => {
  // Solo permitir drag con botón izquierdo del mouse
  if (event.button !== 0) return;
  
  event.preventDefault();
  event.stopPropagation();

  if (!containerRef.value) return;

  const slot = fieldPlayersInSlots.value.find((p) => p.id === slotId);
  if (!slot) return;

  isDragging.value = true;
  draggedPlayerId.value = slotId;
  dragStartPos.value = { x: event.clientX, y: event.clientY };

  // Calcular la posición actual del jugador en píxeles (dentro del área del campo)
  const slotX = fieldArea.value.offsetX + slot.x! * fieldArea.value.width;
  const slotY = fieldArea.value.offsetY + slot.y! * fieldArea.value.height;

  // Guardar el offset entre el mouse y el centro del jugador
  const rect = containerRef.value.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  dragOffset.value = {
    x: mouseX - slotX,
    y: mouseY - slotY,
  };
};

/**
 * Maneja el movimiento del mouse durante el arrastre
 */
const onMouseMove = (event: MouseEvent) => {
  if (!isDragging.value || !draggedPlayerId.value || !containerRef.value) return;

  const rect = containerRef.value.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Restar el offset para mantener el punto de agarre
  const playerX = mouseX - dragOffset.value.x;
  const playerY = mouseY - dragOffset.value.y;

  // Convertir a coordenadas normalizadas dentro del área del campo
  let normalizedX = (playerX - fieldArea.value.offsetX) / fieldArea.value.width;
  let normalizedY = (playerY - fieldArea.value.offsetY) / fieldArea.value.height;

  // Limitar entre 0 y 1
  normalizedX = Math.max(0, Math.min(1, normalizedX));
  normalizedY = Math.max(0, Math.min(1, normalizedY));

  // Actualizar la posición en el store
  lineupStore.updateSlotPosition(draggedPlayerId.value, normalizedX, normalizedY);

  // Emitir evento para compatibilidad con componentes padres
  emit('playerMove', draggedPlayerId.value, normalizedX, normalizedY);
};

/**
 * Finaliza el arrastre
 */
const onMouseUp = () => {
  isDragging.value = false;
  draggedPlayerId.value = null;
  dragOffset.value = { x: 0, y: 0 };
};

// Referencias para los listeners dinámicos
let cleanupMouseMove: (() => void) | null = null;
let cleanupMouseUp: (() => void) | null = null;

/**
 * Observar isDragging para registrar/desregistrar listeners dinámicamente
 */
watch(isDragging, (dragging) => {
  if (dragging) {
    // Iniciar drag: registrar listeners globales
    cleanupMouseMove = useEventListener(document, 'mousemove', onMouseMove);
    cleanupMouseUp = useEventListener(document, 'mouseup', onMouseUp);
  } else {
    // Finalizar drag: limpiar listeners
    if (cleanupMouseMove) {
      cleanupMouseMove();
      cleanupMouseMove = null;
    }
    if (cleanupMouseUp) {
      cleanupMouseUp();
      cleanupMouseUp = null;
    }
  }
});
// ==================== WATCHERS & OBSERVERS ====================

/**
 * Observar cambios en el tamaño del contenedor
 */
useResizeObserver(containerRef, () => {
  resizeCanvas();
});

// ==================== MENU HANDLERS ====================
// Nota: Los handlers ahora usan helpers importados para evitar duplicación de código

/**
 * Wrapper para ver detalles del jugador
 */
const onViewPlayerDetails = (playerId: number) => {
  handleViewPlayerDetails({ playerId, lineupStore, lineupDialogs });
};

/**
 * Wrapper para editar valor del jugador
 */
const onEditPlayerValue = (playerId: number) => {
  handleEditPlayerValue({ playerId, lineupStore, lineupDialogs });
};

/**
 * Wrapper para intercambiar jugador
 */
const onSwapPlayer = (currentPlayerId: number) => {
  handleSwapPlayer({
    currentPlayerId,
    lineupStore,
    lineupDialogs,
    lineupFeedback,
    allPlayersInSlots: allPlayersInSlots.value,
  });
};

/**
 * Wrapper para mover jugador a la banca
 */
const onMovePlayerToBench = (playerId: number) => {
  handleMovePlayerToBench({ playerId, lineupStore, lineupFeedback });
};

/**
 * Wrapper para remover jugador
 */
const onRemovePlayer = (playerId: number) => {
  handleRemovePlayer({ playerId, lineupStore, lineupFeedback });
};

/**
 * Maneja el reinicio completo del campo y banquillo
 */
const handleResetLineup = () => {
  // Resetear completamente la alineación (jugadores, posiciones, equipo, entrenador, nombre)
  lineupStore.resetLineupSettings();
  // Mostrar feedback al usuario
  lineupFeedback.resetSuccess();
};

/**
 * Observar cambios en los jugadores
 * (Ya no es necesario redibujar canvas, los componentes se actualizan automáticamente)
 */

// ==================== LIFECYCLE ====================

/**
 * Inicializar componente al montarse
 */
onMounted(async () => {
  console.log('🏟️ Inicializando campo de fútbol...');

  // Cargar la imagen del campo
  await loadFieldImage();

  // Inicializar el canvas
  initCanvas();

  // Dibujar el campo
  drawField();
});

/**
 * Limpieza al desmontar el componente
 */
onUnmounted(() => {
  console.log('👋 Limpiando campo de fútbol...');
});
</script>

<style scoped>
.soccer-field-container {
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1500px;
  perspective-origin: center center;
  padding: 40px;
}

/* Canvas del campo (se puede inclinar) */
.soccer-field-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease-out;
}

/* Efecto 3D inclinado SOLO para el campo */
.soccer-field-canvas.effect-3d {
  transform: rotateX(50deg) /* Inclinación hacia adelante */ rotateZ(0deg) scale(1.2)
    translateY(-150px);
  /* Sin rotación horizontal */

  transform-style: preserve-3d;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
}

/* Capa para jugadores (SIEMPRE vertical, sin rotación) */
.soccer-players-layer {
  pointer-events: none; /* Los eventos los manejan los PlayerSlot individuales */
  z-index: 10;
  /* NO tiene transform - permanece vertical */
}
</style>
