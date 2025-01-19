import { IAbilityMultiplier } from "../resources/interfaces/game/IAbilityMultiplier";
import { IDieRoll } from "../resources/interfaces/game/IDieRoll";
import { ISpell } from "../resources/interfaces/game/ISpell";
import { SpellRolls } from "../resources/types/SpellRoles";
import { SpellTypes } from "../resources/types/SpellTypes";
import { AbilityMultiplier } from "./AbilityMultiplier";

export class Spell implements ISpell {
    damage: IDieRoll = { base: 0, die: 0, numRolls: 0 };
    defense: IDieRoll = { base: 0, die: 0, numRolls: 0 };
    spellClass: SpellTypes = SpellTypes.NONE;
    spellRole: SpellRolls = SpellRolls.STATIC;
    firstStrike: boolean = false;
    charageable: boolean = false;
    ignites: boolean = false;
    negatesFireDamge: boolean = false;
    negateBlockOverflowModifier: boolean = false;
    modifier: IAbilityMultiplier = new AbilityMultiplier(0, SpellTypes.NONE, SpellRolls.STATIC, false);
    readsOpponent: boolean = false;
    reselectSpells: boolean = false;
    gainManaFromDamage: boolean = false;

    private getType(spellClass: number) {
        switch (spellClass) {
            case 0:
                return SpellTypes.FIRE
            case 1:
                return SpellTypes.WATER
            case 2:
                return SpellTypes.ELECTRIC
            case 3:
                return SpellTypes.NONE
            case 4:
                return SpellTypes.ALL
            default:
                console.log('spellCalss value incorrect (!= 0|1|2|3)')
                return SpellTypes.NONE
        }
    }

    private getRole(spellRole: number) {
        switch(spellRole) {
            case 0:
                return SpellRolls.ATTACK
            case 1:
                return SpellRolls.DEFENSE
            case 2:
                return SpellRolls.STATIC
            default:
                console.log('spellRole value incorrect (!=0|1|2');
                return SpellRolls.STATIC
        }
    }

    setDamage(base: number, die: number, numRolls: number) {
        this.damage = {
            base: base,
            die: die,
            numRolls: numRolls
        }
    }

    setDefense(base: number, die: number, numRolls: number) {
        this.damage = {
            base: base,
            die: die,
            numRolls: numRolls
        }
    }

    setSpellType(spellClass: number) {
        this.spellClass = this.getType(spellClass);
            
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

    setSpellRole(role: number) {
        this.spellRole = this.getRole(role)
    }

    setModifier(modifierAmount: number, modiferType: number, modifierRole: number, removeAfterUse: number) {
        this.modifier = new AbilityMultiplier(
            modifierAmount, 
            this.getType(modiferType), 
            this.getRole(modifierRole), 
            Boolean(removeAfterUse)
        )
    }
}