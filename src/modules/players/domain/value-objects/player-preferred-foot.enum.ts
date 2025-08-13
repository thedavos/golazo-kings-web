export enum PlayerPreferredFoot {
  LEFT = 'left',
  RIGHT = 'right',
  BOTH = 'both',
}

export const PlayerPreferredFootLabels: Record<PlayerPreferredFoot, string> = {
  [PlayerPreferredFoot.LEFT]: 'Izquierdo',
  [PlayerPreferredFoot.RIGHT]: 'Derecho',
  [PlayerPreferredFoot.BOTH]: 'Ambidiestro',
};
