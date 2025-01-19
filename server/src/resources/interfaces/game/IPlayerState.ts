import { IBasicStats } from "./IBasicStats"
import { IAbilityMultiplier } from "./IAbilityMultiplier"

export interface IPLayerState {
    playerStats: IBasicStats,
    modifiers: Array<IAbilityMultiplier>,
    manaCostMultiplier: number,
    ignited: number,
    spells: Array<string>,
    observedSpells: Array<string> | null
    observedStats: IBasicStats | null
}