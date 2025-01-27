export default class Converter {
    constructor() {}
    spellTypeToString(spellType) {
        const spellTypes = ["Attack", "Block", "Heal", "Recharge", "Passive"]
        return spellTypes[spellType]
    }

    spellClassToString(spellClass) {
        const spellClasses = ["Fire", "Water", "Electric", "All", "None"]
        return spellClasses[spellClass]
    }
}