import { SpellFactory } from "../factories/SpellFactory";
import { IAbilityMultiplier } from "../resources/interfaces/game/IAbilityMultiplier";
import { IGameState } from "../resources/interfaces/game/IGameState";
import { IPLayerState } from "../resources/interfaces/game/IPlayerState";
import { IPlayerTurn } from "../resources/interfaces/game/IPlayerTurn";
import { ISpell } from "../resources/interfaces/game/ISpell";
import { GameEndTypes } from "../resources/types/GameEndTypes";
import { SpellRoles } from "../resources/types/SpellRoles";

export class Game  {
    protected gameState: IGameState;
    protected spellFactory;
    constructor(gameState: IGameState) {
        this.gameState = gameState;
        this.spellFactory = new SpellFactory();
    }

    private winner() {
        const isPlayer1Alive = this.gameState.player1.playerStats.health > 0;
        const isPlayer2Alive = this.gameState.player2.playerStats.health > 0;
        if (isPlayer1Alive && isPlayer2Alive) return GameEndTypes.ONGOING;
        if (!isPlayer1Alive && !isPlayer2Alive) return GameEndTypes.TIE;
        return isPlayer1Alive ? GameEndTypes.PLAYER_1_WINS : GameEndTypes.PLAYER_2_WINS;
    }

    private makeRoll(numRolls: number, die: number, base: number) {
        let amount = base;
        for (let i = 0; i < numRolls; i++) amount += Math.floor(Math.random() * die);
        return amount;
    }
    
    private dealDamage(player: IPLayerState, damage: number) {        
        player.playerStats.health -= damage;
    }

    private ignitedDamage(player: IPLayerState) {
        if (player.ignited > 0) {
            player.ignited -= 1;
            this.dealDamage(player, this.makeRoll(1, 6, 0));
        }
    }

    private applyActiveModifiers(player: IPLayerState, spell: ISpell, chargedModifier: number) {
        let modifier = chargedModifier;

        player.modifiers
        .filter((abilityModifer) => abilityModifer.applyCondition(spell))
        .forEach((abilityModifer) => modifier *= abilityModifer.multiplier);
        player.modifiers = player.modifiers
        .filter((abilityModifer) => !abilityModifer.deleteCondition(spell));

        if (player.playerStats.classType === spell.spellClass) modifier *= player.playerStats.classMultiplier;
        return modifier;
    }

    private resolveBlock(player: IPLayerState, spell: ISpell, chargedModifier: number) {
        const die = spell.defense;
        let roll = this.makeRoll(
            die.numRolls,
            die.die,
            die.base
        );
        if (die.numRolls + die.base > 0) roll *= this.applyActiveModifiers(player, spell, chargedModifier);
        return roll;
    }

    private resolveSpellDamage(player: IPLayerState, spell: ISpell, chargedModifier: number) {
        const die = spell.damage;
        let roll = this.makeRoll(
            die.numRolls,
            die.die,
            die.base
        );
        if (die.numRolls + die.base > 0) roll *= this.applyActiveModifiers(player, spell, chargedModifier);
        return roll;
    
    }

    private resolveSpell(spell1: ISpell, chargeModifier1: number, spell2: ISpell, chargeModifier2: number) {
        // Deal ignited damage first
        this.ignitedDamage(this.gameState.player1);
        this.ignitedDamage(this.gameState.player2);
        if (this.winner() !== GameEndTypes.ONGOING) return this.winner();

        // Resolve Healing 
        this.gameState.player1.playerStats.health += this.makeRoll(spell1.healing.numRolls, spell1.healing.die, spell1.healing.base);
        this.gameState.player2.playerStats.health += this.makeRoll(spell2.healing.numRolls, spell2.healing.die, spell2.healing.base);
        
        // Calculate Blocks next 
        let player1Block = this.resolveBlock(this.gameState.player1, spell1, chargeModifier1);
        let player2Block = this.resolveBlock(this.gameState.player2, spell2, chargeModifier2);

        // Calculate First Strike Damage
        const player1FirstStikeDamage = spell1.firstStrike ? this.resolveSpellDamage(this.gameState.player1, spell1, chargeModifier1) : 0;
        const player2FirstStikeDamage = spell2.firstStrike ? this.resolveSpellDamage(this.gameState.player2, spell2, chargeModifier2) : 0;
        player1Block -= player2FirstStikeDamage;
        player2Block -= player1FirstStikeDamage;
        if (player1Block < 0) this.gameState.player1.playerStats.health += player1Block;
        if (player2Block < 0) this.gameState.player2.playerStats.health += player2Block;
        if (this.winner() !== GameEndTypes.ONGOING) return this.winner();

        // Resolve Damage
        const player1Damage = !spell1.firstStrike ? this.resolveSpellDamage(this.gameState.player1, spell1, chargeModifier1) : 0;
        const player2Damage = !spell2.firstStrike ? this.resolveSpellDamage(this.gameState.player2, spell2, chargeModifier2) : 0;

        // Resolve Statics
    }

    private getManaSpent(spell: ISpell, manaSpent: number, playerState: IPLayerState) {
        manaSpent = (playerState.playerStats.mana >= manaSpent) ? manaSpent : playerState.playerStats.mana;
        manaSpent -= manaSpent % spell.manaCost;
        return (!spell.charageable && manaSpent > spell.manaCost) ? spell.manaCost : manaSpent;
    }

    public async completeTurn(player1Turn: IPlayerTurn, player2Turn: IPlayerTurn): Promise<IGameState> {
        const player1Spell = await this.spellFactory.getSpell(player1Turn.spellId);
        const player2Spell = await this.spellFactory.getSpell(player2Turn.spellId);
        const player1ManaSpent = this.getManaSpent(player1Spell, player1Turn.manaSpent, this.gameState.player1);
        const player2ManaSpent = this.getManaSpent(player2Spell, player2Turn.manaSpent, this.gameState.player2);
        const player1ChargeModifier = Math.floor(player1ManaSpent / player1Spell.manaCost);
        const player2ChargeModifier = Math.floor(player2ManaSpent / player2Spell.manaCost);
        this.gameState.player1.playerStats.mana -= player1ManaSpent;
        this.gameState.player2.playerStats.mana -= player2ManaSpent;

        return this.gameState;
    }
}