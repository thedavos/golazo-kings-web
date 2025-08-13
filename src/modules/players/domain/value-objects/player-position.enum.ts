export enum PlayerPosition {
  PORTERO = 'Portero',
  PORTERA = 'Portera',
  DEFENSA_LATERAL_DERECHO = 'Defensa Lateral Derecho',
  DEFENSA_LATERAL_IZQUIERDO = 'Defensa Lateral Izquierdo',
  DEFENSA_CENTRAL = 'Defensa Central',
  DEFENSA = 'Defensa',
  VOLANTE_IZQUIERDO_EXTREMO = 'Volante Izquierdo Extremo',
  VOLANTE_IZQUIERDO = 'Volante Izquierdo',
  VOLANTE_DERECHO_EXTREMO = 'Volante Derecho Extremo',
  VOLANTE_DERECHO = 'Volante Derecho',
  MEDIO_CENTRO_DERECHO = 'Medio Centro Derecho',
  MEDIO_CENTRO_IZQUIERDO = 'Medio Centro Izquierdo',
  MEDIO_CENTRO = 'Medio Centro',
  MEDIA_PUNTA = 'Media Punta',
  DELANTERO_CENTRO = 'Delantero Centro',
  DELANTERA_CENTRO = 'Delantera Centro',
  DELANTERO_IZQUIERDO = 'Delantero Izquierdo',
  DELANTERO_DERECHO = 'Delantero Derecho',
}

export enum PlayerPositionAbbreviation {
  PO = 'PO', // Portero/Portera
  DFC = 'DFC', // Defensa Central
  DFI = 'DFI', // Defensa Lateral Izquierdo
  DFD = 'DFD', // Defensa Lateral Derecho
  DF = 'DF', // Defensa (genérico)
  VIE = 'VIE', // Volante Izquierdo Extremo
  VI = 'VI', // Volante Izquierdo
  VDE = 'VDE', // Volante Derecho Extremo
  VD = 'VD', // Volante Derecho
  MC = 'MC', // Mediocentro
  MCD = 'MCD', // Mediocentro Derecho
  MCI = 'MCI', // Mediocentro Izquierdo
  MI = 'MI', // Medio Izquierdo (alternativo para VI)
  MD = 'MD', // Medio Derecho (alternativo para VD)
  MP = 'MP', // Media Punta
  DC = 'DC', // Delantero Centro / Delantera Centro
  DI = 'DI', // Delantero Izquierdo
  DD = 'DD', // Delantero Derecho
}
