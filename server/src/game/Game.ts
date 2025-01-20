import { SpellFactory } from "../factories/SpellFactory";
import { IAbilityMultiplier } from "../resources/interfaces/game/IAbilityMultiplier";
import { IGameState } from "../resources/interfaces/game/IGameState";
import { IPLayerState } from "../resources/interfaces/game/IPlayerState";
import { IPlayerTurn } from "../resources/interfaces/game/IPlayerTurn";
import { ISpell } from "../resources/interfaces/game/ISpell";
import { GameEndTypes } from "../resources/types/GameEndTypes";

export class Game  {
    protected gameState: IGameState
    protected spellFactory
    constructor(gameState: IGameState) {
        this.gameState = gameState
        this.spellFactory = new SpellFactory()
    }

    private winner() {
        const isPlayer1Alive = this.gameState.player1.playerStats.health > 0
        const isPlayer2Alive = this.gameState.player2.playerStats.health > 0
        if (isPlayer1Alive && isPlayer2Alive) return GameEndTypes.ONGOING
        if (!isPlayer1Alive && !isPlayer2Alive) return GameEndTypes.TIE
        return isPlayer1Alive ? GameEndTypes.PLAYER_1_WINS : GameEndTypes.PLAYER_2_WINS
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

    private applyActiveModifiers(player: IPLayerState, spell: ISpell, chargedModifier: number) {
        let modifier = chargedModifier

        player.modifiers
        .filter((abilityModifer) => abilityModifer.applyCondition(spell))
        .forEach((abilityModifer) => modifier *= abilityModifer.multiplier)
        player.modifiers = player.modifiers
        .filter((abilityModifer) => !abilityModifer.deleteCondition(spell))

        if (player.playerStats.classType === spell.spellClass) modifier *= player.playerStats.classMultiplier
        return modifier
    }

    private resolveBlock(spell: ISpell, chargedModifier: number) {
        
    }

    private resolveSpellDamage(spell: ISpell, chargedModifier: number) {
        
    }

    private resolveSpell(spell1: ISpell, chargedModifier1: number, spell2: ISpell, chargedModifier2: number) {
        // Deal ignited damage first
        this.ignitedDamage(this.gameState.player1)
        this.ignitedDamage(this.gameState.player2)
        if (this.winner() !== GameEndTypes.ONGOING) return this.winner()
        
        // Calculate Blocks next 

        // Calculate First Strike Damage

        // Resolve Heals

        // Resolve Damage

        // Resolve Statics
    }

    private getManaSpent(spell: ISpell, manaSpent: number, playerState: IPLayerState) {
        manaSpent = (playerState.playerStats.mana >= manaSpent) ? manaSpent : playerState.playerStats.mana
        manaSpent -= manaSpent % spell.manaCost
        return (!spell.charageable && manaSpent > spell.manaCost) ? spell.manaCost : manaSpent
    }

    public async completeTurn(player1Turn: IPlayerTurn, player2Turn: IPlayerTurn): Promise<IGameState> {
        const player1Spell = await this.spellFactory.getSpell(player1Turn.spellId)
        const player2Spell = await this.spellFactory.getSpell(player2Turn.spellId)
        const player1ManaSpent = this.getManaSpent(player1Spell, player1Turn.manaSpent, this.gameState.player1)
        const player2ManaSpent = this.getManaSpent(player2Spell, player2Turn.manaSpent, this.gameState.player2)
        const player1ChargeModifier = Math.floor(player1ManaSpent / player1Spell.manaCost)
        const player2ChargeModifier = Math.floor(player2ManaSpent / player2Spell.manaCost)
        this.gameState.player1.playerStats.mana -= player1ManaSpent
        this.gameState.player2.playerStats.mana -= player2ManaSpent

        return this.gameState
    }
}