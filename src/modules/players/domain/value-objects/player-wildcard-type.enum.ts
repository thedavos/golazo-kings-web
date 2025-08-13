export enum PlayerWildcardType {
  REGULAR = 'regular',
  SPECIAL_GUEST = 'special_guest',
  STREAMER = 'streamer',
  INFLUENCER = 'influencer',
  LEGEND = 'legend',
  FIRST_DIVISION = 'first_division',
  SECOND_DIVISION = 'second_division',
}

export const PlayerWildcardTypeLabels: Record<PlayerWildcardType, string> = {
  [PlayerWildcardType.REGULAR]: 'Regular',
  [PlayerWildcardType.SPECIAL_GUEST]: 'Invitado Especial',
  [PlayerWildcardType.STREAMER]: 'Streamer',
  [PlayerWildcardType.INFLUENCER]: 'Influencer',
  [PlayerWildcardType.LEGEND]: 'Leyenda',
  [PlayerWildcardType.FIRST_DIVISION]: 'Primera División',
  [PlayerWildcardType.SECOND_DIVISION]: 'Segunda División',
};

export const PlayerWildcardTypeDescriptions: Record<PlayerWildcardType, string> = {
  [PlayerWildcardType.REGULAR]: 'Jugador wildcard regular',
  [PlayerWildcardType.SPECIAL_GUEST]: 'Invitado especial para eventos puntuales',
  [PlayerWildcardType.STREAMER]: 'Creador de contenido especializado en streaming',
  [PlayerWildcardType.INFLUENCER]: 'Influencer de redes sociales',
  [PlayerWildcardType.LEGEND]: 'Leyenda del fútbol profesional',
  [PlayerWildcardType.FIRST_DIVISION]: 'Jugador proveniente de primera división',
  [PlayerWildcardType.SECOND_DIVISION]: 'Jugador proveniente de segunda división',
};
