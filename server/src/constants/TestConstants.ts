import schemas, { IDatabaseSpell } from '../models/schemas'
import { Spells } from './Spells';

export type DynamicObject = {
    [key: string]: any; 
};


export const InitSpellRolls = async () => {
    const SPELL_ROLL: DynamicObject = {};
    const keys = Object.keys(Spells);
    const loops = keys.length / 2;
    for (let i = 0; i < loops; i++) {
        const spellData =  await schemas.Spells.where({id: i}).findOne();
        if (!spellData) {
            throw new Error(`Spell with ID ${i} not found`);
        };
        SPELL_ROLL[keys[loops + i]] = spellData.abilityBase + spellData.abilityDie + spellData.abilityNumDie;
    };

    // Additional roll values to add [NEED CHANGED MANUALLY IF UPDATED]
    SPELL_ROLL["IGNITED"] = 7;
    SPELL_ROLL["SELF_INFLICTED_DAMAGE"] = 7;
    SPELL_ROLL["BLOCK_MODIFER_AMOUNT"] = 4;
    return SPELL_ROLL;
};
