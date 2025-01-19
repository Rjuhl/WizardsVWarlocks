import { IAbilityMultiplier } from "../resources/interfaces/game/IAbilityMultiplier";
import { ISpell } from "../resources/interfaces/game/ISpell";
import { SpellRolls } from "../resources/types/SpellRoles";
import { SpellTypes } from "../resources/types/SpellTypes";

export class AbilityMultiplier implements IAbilityMultiplier {
    public readonly multiplier: number
    public readonly type: SpellTypes
    public readonly role: SpellRolls
    private removeAfterUse: boolean
    constructor(multiplier: number, type: SpellTypes, role: SpellRolls, removeAfterUse: boolean) {
        this.multiplier = multiplier
        this.type = type
        this.role = role
        this.removeAfterUse = removeAfterUse
    }
    deleteCondition(castSpell: ISpell): boolean {
        return (
            this.removeAfterUse &&
            this.type === castSpell.spellClass &&
            this.role === castSpell.spellRole
        )
    }
}