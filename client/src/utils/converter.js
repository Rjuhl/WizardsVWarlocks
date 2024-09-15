export default class Converter {
    constructor() {}
    spellTypeToString(spellType) {
        const spellTypes = ["Attack", "Block", "Passive"]
        return spellTypes[spellType]
    }

    spellClassToString(spellClass) {
        const spellClasses = ["Fire", "Water", "Electric", "Basic"]
        return spellClasses[spellClass]
    }
}