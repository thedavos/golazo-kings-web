import type { FieldSlot, PlayerSlot } from 'src/modules/lineup-builder/types';

export const PLAYER_IN_FIELD_SLOTS: Map<string, FieldSlot> = new Map();

export const PLAYER_IN_BENCH_SLOTS: PlayerSlot[] = [
  // BANCA (5 suplentes) - distribuidos en la zona de la banca
  { id: '8', name: 'Suplente', playerId: null, position: null, x: null, y: null, isBench: true },
  { id: '9', name: 'Suplente', playerId: null, position: null, x: null, y: null, isBench: true },
  { id: '10', name: 'Suplente', playerId: null, position: null, x: null, y: null, isBench: true },
  {
    id: '11',
    name: 'Suplente',
    playerId: null,
    position: null,
    x: null,
    y: null,
    isBench: true,
  },
  { id: '12', name: 'Suplente', playerId: null, position: null, x: null, y: null, isBench: true },
];
