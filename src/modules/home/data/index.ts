import kingsPlayersData from './kings-players.json';
import queensPlayersData from './queens-players.json';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

export const kingsPlayers = kingsPlayersData as PlayerDto[];
export const queensPlayers = queensPlayersData as PlayerDto[];
export const allPlayers = [...kingsPlayers, ...queensPlayers] as PlayerDto[];

export { kingsPlayersData, queensPlayersData };
