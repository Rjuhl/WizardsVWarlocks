const schemas = require('../models/schemas')

export class SpellFactory {
    private spellSchema
    constructor() {
        this.spellSchema = schemas.SpellSchema
    }

    private async getSpellData(spellId) {
        return await this.spellSchema.where({id: spellId}).findOne()
    }

    public async getSpell(spellId) {
        const spellData = await this.getSpellData(spellId)
    }
}