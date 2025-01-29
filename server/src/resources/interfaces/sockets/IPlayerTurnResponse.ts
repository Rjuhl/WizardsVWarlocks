import { IPLayerState } from "../game/IPlayerState"

export interface IPlayerTurnResponse {
    player: string
    playerState: IPLayerState,
    damageDelivered: number,
    damageTaken: number,
    manaSpent: number,
    winner: string | null
}