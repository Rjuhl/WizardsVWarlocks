const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    id: {type:String},
    admin:{type:Boolean, default:false},
    username: {type:String},
    password: {type:String},
    hatColor: {type:Array, maxItems:3},
    staffColor: {type:Array, maxItems:3},
    health: {type:Number},
    mana: {type: Number},
    classMultiplier: {type:Number},
    class: {type:Number, default: -1},
    money: {type:Number, default:100},
    activeSpells: {type:Array, maxItems:6, uniqueItems:true},
    spellsOwned: {type:Array, maxItems:20, uniqueItems:true},
    entryDate: {type:Date, default:Date.now}
})

const spellSchema = new Schema({
    id: {type:String},
    name: {type:String},
    type: {type:Number},
    class: {type:Number},
    manaCost: {type:Number},
    goldCost: {type:Number},
    abilityBase: {type:Number},
    abilityDie: {type:Number},
    abilityNumDie: {type:Number},
    flags: {type:Array, minItems:20, maxItems:20},
    description: {type:String}
})

const Users = mongoose.model('Users', userSchema, 'users')
const Spells = mongoose.model('Spells', spellSchema, 'spells')
const mySchemas = {'Users': Users, 'Spells': Spells}

module.exports = mySchemas