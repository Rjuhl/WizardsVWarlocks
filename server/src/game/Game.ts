import { IGameState } from "../resources/interfaces/game/IGameState";
import { IPLayerState } from "../resources/interfaces/game/IPlayerState";
import { IPlayerTurn } from "../resources/interfaces/game/IPlayerTurn";
import { ISpell } from "../resources/interfaces/game/ISpell";

export class Game  {
    protected gameState: IGameState
    constructor(gameState: IGameState) {
        this.gameState = gameState
    }

    private makeRoll(numRolls: number, die: number, base: number) {
        let amount = base
        for (let i = 0; i < numRolls; i++) { amount += Math.floor(Math.random() * die) }
        return amount
    }
    
    private dealDamage(player: IPLayerState, damage: number) {        
        player.playerStats.health -= damage
    }

    private ignitedDamage(player: IPLayerState) {
        if (player.ignited > 0) {
            player.ignited -= 1
            this.dealDamage(player, this.makeRoll(1, 6, 0))
        }
    }

    private resolveSpellDamage(spell1: ISpell, spell2: ISpell) {

    }

    private castSpells(spell1: ISpell, spell2: ISpell) {
        // Deal damage
        // Apply Modifiers

    }

    completeTurn(playerOneTurn: IPlayerTurn, playerTwoTurn: IPlayerTurn): IGameState {
        return this.gameState
    }
}