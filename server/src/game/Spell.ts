import { IAbilityMultiplier } from "../resources/interfaces/game/IAbilityMultiplier";
import { IDieRoll } from "../resources/interfaces/game/IDieRoll";
import { ISpell } from "../resources/interfaces/game/ISpell";
import { SpellRoles } from "../resources/types/SpellRoles";
import { SpellTypes } from "../resources/types/SpellTypes";
import { AbilityMultiplier } from "./AbilityMultiplier";

export class Spell implements ISpell {
    damage: IDieRoll = { base: 0, die: 0, numRolls: 0 };
    defense: IDieRoll = { base: 0, die: 0, numRolls: 0 };
    healing: IDieRoll = { base: 0, die: 0, numRolls: 0 };
    manaRecharge: IDieRoll = { base: 0, die: 0, numRolls: 0 };
    manaCost: number = 0;
    spellClass: SpellTypes = SpellTypes.NONE;
    spellRole: SpellRoles = SpellRoles.NONE;
    firstStrike: boolean = false;
    charageable: boolean = false;
    ignites: boolean = false;
    negatesFireDamge: boolean = false;
    negateBlockOverflowModifier: boolean = false;
    modifier: IAbilityMultiplier | null = null;
    readsOpponent: boolean = false;
    reselectSpells: boolean = false;
    gainManaFromDamage: boolean = false;
    selfInflictedDamage: boolean = false;

    setDamage(base: number, die: number, numRolls: number) {
        this.damage = {
            base: base,
            die: die,
            numRolls: numRolls
        }
    }

    setDefense(base: number, die: number, numRolls: number) {
        this.defense = {
            base: base,
            die: die,
            numRolls: numRolls
        }
    }

    setHealing(base: number, die: number, numRolls: number) {
        this.healing = {
            base: base,
            die: die,
            numRolls: numRolls
        }
    }

    setManaRecharge(base: number, die: number, numRolls: number) {
        this.manaRecharge = {
            base: base,
            die: die,
            numRolls: numRolls
        }
    }

    setSpellType(spellClass: SpellTypes) {
        this.spellClass = spellClass
            
    }

    setManaCost(cost: number) {
        this.manaCost = cost
    }
    
    setFirstStrike(isTrue: number) {
        this.firstStrike = Boolean(isTrue)
    }

    setCharageable(isTrue: number) {
        this.charageable = Boolean(isTrue)
    }

    setIgnites(isTrue: number) {
        this.ignites = Boolean(isTrue)
    }

    setNegatesFireDamge(isTrue: number) {
        this.negatesFireDamge = Boolean(isTrue)
    }

    setNegateBlockOverflowModifier(isTrue: number) {
        this.negateBlockOverflowModifier = Boolean(isTrue)
    }

    setReadsOpponent(isTrue: number) {
        this.readsOpponent = Boolean(isTrue)
    }
    
    setReselectSpells(isTrue: number) {
        this.reselectSpells = Boolean(isTrue)
    }

    setGainManaFromDamage(isTrue: number) {
        this.gainManaFromDamage = Boolean(isTrue)
    }

    setSelfInflictedDamage(isTrue: number) {
        this.selfInflictedDamage = Boolean(isTrue)
    }

    setSpellRole(role: SpellRoles) {
        this.spellRole = role
    }

    setModifier(modifierAmount: number, modiferType: SpellTypes, modifierRole: SpellRoles, removeAfterUse: number) {
        modifierAmount !== 0 ?
        this.modifier = new AbilityMultiplier(
            modifierAmount, 
            modiferType, 
            modifierRole, 
            Boolean(removeAfterUse)
        ) : this.modifier = null
    }
}