import { SpellRolls } from "../../types/SpellRoles";
import { SpellTypes } from "../../types/SpellTypes"
import { ISpell } from "./ISpell";


export interface IAbilityMultiplier {
    multiplier: number,
    type: SpellTypes,
    role: SpellRolls,
    deleteCondition(castSpell: ISpell): boolean
}