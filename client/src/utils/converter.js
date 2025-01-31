export default class Converter {
    constructor() {}
    spellTypeToString(spellType) {
        const spellTypes = ["Attack", "Block", "Heal", "Recharge", "Passive", "None", "All"]
        return spellTypes[spellType]
    }

    spellClassToString(spellClass) {
        const spellClasses = ["Fire", "Water", "Electric", "All", "None"]
        return spellClasses[spellClass]
    }
}