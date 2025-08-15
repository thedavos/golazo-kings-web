import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

export interface SearchResult {
  player: PlayerDto;
  score: number;
  matchedFields: string[];
}
