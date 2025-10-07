/**
 * Estados posibles para las operaciones de alineaciones guardadas
 */
export const SAVED_LINEUPS_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

/**
 * Tipo para el estado de saved lineups
 */
export type SavedLineupsStateType = typeof SAVED_LINEUPS_STATE[keyof typeof SAVED_LINEUPS_STATE];