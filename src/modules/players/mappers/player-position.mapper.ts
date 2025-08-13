import {
  PlayerPosition,
  PlayerPositionAbbreviation,
} from 'src/modules/players/domain/value-objects/player-position.enum';

export class PositionMapper {
  private static readonly POSITION_MAP: Record<string, PlayerPosition> = {
    // Mapeos exactos del enum
    Portero: PlayerPosition.PORTERO,
    Portera: PlayerPosition.PORTERA,
    'Defensa Lateral Derecho': PlayerPosition.DEFENSA_LATERAL_DERECHO,
    'Defensa Lateral Izquierdo': PlayerPosition.DEFENSA_LATERAL_IZQUIERDO,
    'Defensa Central': PlayerPosition.DEFENSA_CENTRAL,
    Defensa: PlayerPosition.DEFENSA,
    'Volante Izquierdo Extremo': PlayerPosition.VOLANTE_IZQUIERDO_EXTREMO,
    'Volante Izquierdo': PlayerPosition.VOLANTE_IZQUIERDO,
    'Volante Derecho Extremo': PlayerPosition.VOLANTE_DERECHO_EXTREMO,
    'Volante Derecho': PlayerPosition.VOLANTE_DERECHO,
    'Medio Centro Derecho': PlayerPosition.MEDIO_CENTRO_DERECHO,
    'Medio Centro Izquierdo': PlayerPosition.MEDIO_CENTRO_IZQUIERDO,
    'Medio Centro': PlayerPosition.MEDIO_CENTRO,
    'Media Punta': PlayerPosition.MEDIA_PUNTA,
    'Delantero Centro': PlayerPosition.DELANTERO_CENTRO,
    'Delantera Centro': PlayerPosition.DELANTERA_CENTRO,
    'Delantero Izquierdo': PlayerPosition.DELANTERO_IZQUIERDO,
    'Delantero Derecho': PlayerPosition.DELANTERO_DERECHO,

    // Mapeos comunes y variaciones - PORTEROS
    portero: PlayerPosition.PORTERO,
    portera: PlayerPosition.PORTERA,
    arquero: PlayerPosition.PORTERO,
    guardameta: PlayerPosition.PORTERO,
    goalkeeper: PlayerPosition.PORTERO,
    gk: PlayerPosition.PORTERO,

    // Mapeos comunes y variaciones - DEFENSAS
    defensa: PlayerPosition.DEFENSA,
    defensor: PlayerPosition.DEFENSA,
    central: PlayerPosition.DEFENSA_CENTRAL,
    'defensa central': PlayerPosition.DEFENSA_CENTRAL,
    stopper: PlayerPosition.DEFENSA_CENTRAL,
    libero: PlayerPosition.DEFENSA_CENTRAL,
    lateral: PlayerPosition.DEFENSA,
    'lateral derecho': PlayerPosition.DEFENSA_LATERAL_DERECHO,
    'lateral izquierdo': PlayerPosition.DEFENSA_LATERAL_IZQUIERDO,
    'defensa lateral': PlayerPosition.DEFENSA,
    carrilero: PlayerPosition.DEFENSA_LATERAL_DERECHO,
    'wing back': PlayerPosition.DEFENSA_LATERAL_DERECHO,

    // Mapeos comunes y variaciones - MEDIO CAMPO
    medio: PlayerPosition.MEDIO_CENTRO,
    mediocampista: PlayerPosition.MEDIO_CENTRO,
    centro: PlayerPosition.MEDIO_CENTRO,
    centrocampista: PlayerPosition.MEDIO_CENTRO,
    mediocentro: PlayerPosition.MEDIO_CENTRO,
    'medio centro': PlayerPosition.MEDIO_CENTRO,
    volante: PlayerPosition.MEDIO_CENTRO,
    'volante central': PlayerPosition.MEDIO_CENTRO,
    pivot: PlayerPosition.MEDIO_CENTRO,
    ['contención']: PlayerPosition.MEDIO_CENTRO,
    contenedor: PlayerPosition.MEDIO_CENTRO,
    recuperador: PlayerPosition.MEDIO_CENTRO,

    // Volantes por banda
    'volante derecho': PlayerPosition.VOLANTE_DERECHO,
    'volante izquierdo': PlayerPosition.VOLANTE_IZQUIERDO,
    'volante por derecha': PlayerPosition.VOLANTE_DERECHO,
    'volante por izquierda': PlayerPosition.VOLANTE_IZQUIERDO,
    'extremo derecho': PlayerPosition.VOLANTE_DERECHO_EXTREMO,
    'extremo izquierdo': PlayerPosition.VOLANTE_IZQUIERDO_EXTREMO,
    'banda derecha': PlayerPosition.VOLANTE_DERECHO,
    'banda izquierda': PlayerPosition.VOLANTE_IZQUIERDO,

    // Media punta
    'media punta': PlayerPosition.MEDIA_PUNTA,
    mediapunta: PlayerPosition.MEDIA_PUNTA,
    enganche: PlayerPosition.MEDIA_PUNTA,
    playmaker: PlayerPosition.MEDIA_PUNTA,
    armador: PlayerPosition.MEDIA_PUNTA,
    '10': PlayerPosition.MEDIA_PUNTA,

    // Mapeos comunes y variaciones - DELANTEROS
    delantero: PlayerPosition.DELANTERO_CENTRO,
    delantera: PlayerPosition.DELANTERA_CENTRO,
    atacante: PlayerPosition.DELANTERO_CENTRO,
    'delantero centro': PlayerPosition.DELANTERO_CENTRO,
    'delantera centro': PlayerPosition.DELANTERA_CENTRO,
    'centro delantero': PlayerPosition.DELANTERO_CENTRO,
    punta: PlayerPosition.DELANTERO_CENTRO,
    ariete: PlayerPosition.DELANTERO_CENTRO,
    goleador: PlayerPosition.DELANTERO_CENTRO,
    killer: PlayerPosition.DELANTERO_CENTRO,
    '9': PlayerPosition.DELANTERO_CENTRO,

    // Delanteros por banda
    'delantero derecho': PlayerPosition.DELANTERO_DERECHO,
    'delantero izquierdo': PlayerPosition.DELANTERO_IZQUIERDO,
    extremo: PlayerPosition.DELANTERO_DERECHO, // Por defecto derecho, puede ajustarse
    winger: PlayerPosition.DELANTERO_DERECHO,
    'punta derecha': PlayerPosition.DELANTERO_DERECHO,
    'punta izquierda': PlayerPosition.DELANTERO_IZQUIERDO,

    // Abreviaciones comunes
    po: PlayerPosition.PORTERO,
    df: PlayerPosition.DEFENSA,
    dfc: PlayerPosition.DEFENSA_CENTRAL,
    dfi: PlayerPosition.DEFENSA_LATERAL_IZQUIERDO,
    dfd: PlayerPosition.DEFENSA_LATERAL_DERECHO,
    mc: PlayerPosition.MEDIO_CENTRO,
    mcd: PlayerPosition.MEDIO_CENTRO_DERECHO,
    mci: PlayerPosition.MEDIO_CENTRO_IZQUIERDO,
    mp: PlayerPosition.MEDIA_PUNTA,
    dc: PlayerPosition.DELANTERO_CENTRO,
    di: PlayerPosition.DELANTERO_IZQUIERDO,
    dd: PlayerPosition.DELANTERO_DERECHO,
    vi: PlayerPosition.VOLANTE_IZQUIERDO,
    vd: PlayerPosition.VOLANTE_DERECHO,
    vie: PlayerPosition.VOLANTE_IZQUIERDO_EXTREMO,
    vde: PlayerPosition.VOLANTE_DERECHO_EXTREMO,
    mi: PlayerPosition.VOLANTE_IZQUIERDO,
    md: PlayerPosition.VOLANTE_DERECHO,
  };

  private static readonly POSITION_TO_ABBREVIATION_MAP: Record<
    PlayerPosition,
    PlayerPositionAbbreviation
  > = {
    [PlayerPosition.PORTERO]: PlayerPositionAbbreviation.PO,
    [PlayerPosition.PORTERA]: PlayerPositionAbbreviation.PO,
    [PlayerPosition.DEFENSA_CENTRAL]: PlayerPositionAbbreviation.DFC,
    [PlayerPosition.DEFENSA_LATERAL_IZQUIERDO]: PlayerPositionAbbreviation.DFI,
    [PlayerPosition.DEFENSA_LATERAL_DERECHO]: PlayerPositionAbbreviation.DFD,
    [PlayerPosition.DEFENSA]: PlayerPositionAbbreviation.DF,
    [PlayerPosition.VOLANTE_IZQUIERDO_EXTREMO]: PlayerPositionAbbreviation.VIE,
    [PlayerPosition.VOLANTE_IZQUIERDO]: PlayerPositionAbbreviation.VI,
    [PlayerPosition.VOLANTE_DERECHO_EXTREMO]: PlayerPositionAbbreviation.VDE,
    [PlayerPosition.VOLANTE_DERECHO]: PlayerPositionAbbreviation.VD,
    [PlayerPosition.MEDIO_CENTRO]: PlayerPositionAbbreviation.MC,
    [PlayerPosition.MEDIO_CENTRO_DERECHO]: PlayerPositionAbbreviation.MCD,
    [PlayerPosition.MEDIO_CENTRO_IZQUIERDO]: PlayerPositionAbbreviation.MCI,
    [PlayerPosition.MEDIA_PUNTA]: PlayerPositionAbbreviation.MP,
    [PlayerPosition.DELANTERO_CENTRO]: PlayerPositionAbbreviation.DC,
    [PlayerPosition.DELANTERA_CENTRO]: PlayerPositionAbbreviation.DC,
    [PlayerPosition.DELANTERO_IZQUIERDO]: PlayerPositionAbbreviation.DI,
    [PlayerPosition.DELANTERO_DERECHO]: PlayerPositionAbbreviation.DD,
  };

  private static readonly ABBREVIATION_TO_POSITION_MAP: Record<string, PlayerPosition> = {
    PO: PlayerPosition.PORTERO,
    DFC: PlayerPosition.DEFENSA_CENTRAL,
    DFI: PlayerPosition.DEFENSA_LATERAL_IZQUIERDO,
    DFD: PlayerPosition.DEFENSA_LATERAL_DERECHO,
    DF: PlayerPosition.DEFENSA,
    VIE: PlayerPosition.VOLANTE_IZQUIERDO_EXTREMO,
    VI: PlayerPosition.VOLANTE_IZQUIERDO,
    VDE: PlayerPosition.VOLANTE_DERECHO_EXTREMO,
    VD: PlayerPosition.VOLANTE_DERECHO,
    MC: PlayerPosition.MEDIO_CENTRO,
    MCD: PlayerPosition.MEDIO_CENTRO_DERECHO,
    MCI: PlayerPosition.MEDIO_CENTRO_IZQUIERDO,
    MI: PlayerPosition.VOLANTE_IZQUIERDO,
    MD: PlayerPosition.VOLANTE_DERECHO,
    MP: PlayerPosition.MEDIA_PUNTA,
    DC: PlayerPosition.DELANTERO_CENTRO,
    DI: PlayerPosition.DELANTERO_IZQUIERDO,
    DD: PlayerPosition.DELANTERO_DERECHO,

    // También en minúsculas para flexibilidad
    po: PlayerPosition.PORTERO,
    dfc: PlayerPosition.DEFENSA_CENTRAL,
    dfi: PlayerPosition.DEFENSA_LATERAL_IZQUIERDO,
    dfd: PlayerPosition.DEFENSA_LATERAL_DERECHO,
    df: PlayerPosition.DEFENSA,
    vie: PlayerPosition.VOLANTE_IZQUIERDO_EXTREMO,
    vi: PlayerPosition.VOLANTE_IZQUIERDO,
    vde: PlayerPosition.VOLANTE_DERECHO_EXTREMO,
    vd: PlayerPosition.VOLANTE_DERECHO,
    mc: PlayerPosition.MEDIO_CENTRO,
    mcd: PlayerPosition.MEDIO_CENTRO_DERECHO,
    mci: PlayerPosition.MEDIO_CENTRO_IZQUIERDO,
    mi: PlayerPosition.VOLANTE_IZQUIERDO,
    md: PlayerPosition.VOLANTE_DERECHO,
    mp: PlayerPosition.MEDIA_PUNTA,
    dc: PlayerPosition.DELANTERO_CENTRO,
    di: PlayerPosition.DELANTERO_IZQUIERDO,
    dd: PlayerPosition.DELANTERO_DERECHO,
  };

  /**
   * Mapea una posición de texto al enum PlayerPosition correspondiente
   * @param position - La posición como string que viene del scraping
   * @returns El valor del enum PlayerPosition o null si no se encuentra mapeo
   */
  static mapPosition(position: string | undefined): PlayerPosition | null {
    if (!position) return null;

    // Limpiar el string: quitar espacios extra y convertir a lowercase para búsqueda
    const cleanPosition = position.trim();

    // Buscar coincidencia exacta primero
    if (this.POSITION_MAP[cleanPosition]) {
      return this.POSITION_MAP[cleanPosition];
    }

    // Buscar coincidencia insensible a mayúsculas/minúsculas
    const lowerPosition = cleanPosition.toLowerCase();
    if (this.POSITION_MAP[lowerPosition]) {
      return this.POSITION_MAP[lowerPosition];
    }

    // Verificar si es una abreviación
    if (this.ABBREVIATION_TO_POSITION_MAP[cleanPosition]) {
      return this.ABBREVIATION_TO_POSITION_MAP[cleanPosition];
    }

    // Búsqueda parcial para casos más complejos
    const partialMatches = Object.keys(this.POSITION_MAP).filter(
      (key) =>
        key.toLowerCase().includes(lowerPosition) || lowerPosition.includes(key.toLowerCase()),
    );

    if (partialMatches.length > 0) {
      // Retornar la coincidencia más específica (la más larga)
      const bestMatch = partialMatches.reduce((prev, current) =>
        prev.length >= current.length ? prev : current,
      );

      return this.POSITION_MAP[bestMatch] || null;
    }

    // Si no encuentra mapeo, retornar null
    return null;
  }

  /**
   * Mapea una posición PlayerPosition a su abreviación correspondiente
   * @param position - La posición del enum PlayerPosition
   * @returns El valor del enum PlayerPositionAbbreviation o null si no se encuentra mapeo
   */
  static mapPositionToAbbreviation(
    position: PlayerPosition | undefined,
  ): PlayerPositionAbbreviation | null {
    if (!position) return null;

    return this.POSITION_TO_ABBREVIATION_MAP[position] || null;
  }

  /**
   * Mapea una abreviación a su posición PlayerPosition correspondiente
   * @param abbreviation - La abreviación como string
   * @returns El valor del enum PlayerPosition o null si no se encuentra mapeo
   */
  static mapAbbreviationToPosition(abbreviation: string | undefined): PlayerPosition | null {
    if (!abbreviation) return null;

    const cleanAbbreviation = abbreviation.trim();
    return this.ABBREVIATION_TO_POSITION_MAP[cleanAbbreviation] || null;
  }

  /**
   * Mapea directamente de texto a abreviación (combinando los dos pasos)
   * @param position - La posición como string que viene del scraping
   * @returns El valor del enum PlayerPositionAbbreviation o null si no se encuentra mapeo
   */
  static mapPositionTextToAbbreviation(
    position: string | undefined,
  ): PlayerPositionAbbreviation | null {
    const mappedPosition = this.mapPosition(position);
    if (!mappedPosition) return null;

    return this.mapPositionToAbbreviation(mappedPosition);
  }

  /**
   * Obtiene todos los mapeos de posiciones disponibles
   * @returns Record con todos los mapeos de posición
   */
  static getAllPositionMappings(): Record<string, PlayerPosition> {
    return { ...this.POSITION_MAP };
  }

  /**
   * Obtiene todos los mapeos de abreviaciones disponibles
   * @returns Record con todos los mapeos de abreviación a posición
   */
  static getAllAbbreviationMappings(): Record<string, PlayerPosition> {
    return { ...this.ABBREVIATION_TO_POSITION_MAP };
  }

  /**
   * Obtiene el mapeo de posición a abreviación
   * @returns Record con el mapeo de posición a abreviación
   */
  static getPositionToAbbreviationMappings(): Record<PlayerPosition, PlayerPositionAbbreviation> {
    return { ...this.POSITION_TO_ABBREVIATION_MAP };
  }

  /**
   * Agrega un nuevo mapeo de posición
   * @param key - La clave de posición a mapear
   * @param value - El valor del enum PlayerPosition
   */
  static addPositionMapping(key: string, value: PlayerPosition): void {
    this.POSITION_MAP[key] = value;
  }

  /**
   * Agrega un nuevo mapeo de abreviación
   * @param abbreviation - La abreviación a mapear
   * @param position - El valor del enum PlayerPosition
   */
  static addAbbreviationMapping(abbreviation: string, position: PlayerPosition): void {
    this.ABBREVIATION_TO_POSITION_MAP[abbreviation] = position;
  }

  /**
   * Obtiene las posiciones más comunes para debugging
   * @returns Array con las claves más utilizadas
   */
  static getCommonPositions(): string[] {
    return [
      'Medio',
      'medio',
      'centro',
      'Delantero',
      'delantero',
      'atacante',
      'Defensa',
      'defensa',
      'defensor',
      'Portero',
      'portero',
      'arquero',
      'Lateral',
      'lateral',
      'Extremo',
      'extremo',
      'Media Punta',
      'media punta',
    ];
  }

  /**
   * Obtiene las abreviaciones más comunes
   * @returns Array con las abreviaciones más utilizadas
   */
  static getCommonAbbreviations(): string[] {
    return ['PO', 'DF', 'DFC', 'MC', 'MP', 'DC', 'VI', 'VD', 'DI', 'DD'];
  }

  /**
   * Valida si una posición tiene mapeo disponible
   * @param position - La posición a validar
   * @returns boolean indicando si existe mapeo
   */
  static hasPositionMapping(position: string): boolean {
    return this.mapPosition(position) !== null;
  }

  /**
   * Valida si una abreviación tiene mapeo disponible
   * @param abbreviation - La abreviación a validar
   * @returns boolean indicando si existe mapeo
   */
  static hasAbbreviationMapping(abbreviation: string): boolean {
    return this.mapAbbreviationToPosition(abbreviation) !== null;
  }
}
