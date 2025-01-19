import { SpellRolls } from "../../types/SpellRoles";
import { SpellTypes } from "../../types/SpellTypes";
import { IAbilityMultiplier } from "./IAbilityMultiplier";
import { IDieRoll } from "./IDieRoll";

export interface ISpell {
    damage: IDieRoll,
    defense: IDieRoll,
    spellClass: SpellTypes,
    spellRole: SpellRolls,
    firstStrike: boolean,
    charageable: boolean,
    ignites: boolean,
    negatesFireDamge: boolean,
    negateBlockOverflowModifier: boolean,
    modifier: IAbilityMultiplier,
    readsOpponent: boolean,
    reselectSpells: boolean,
    gainManaFromDamage: boolean,
}