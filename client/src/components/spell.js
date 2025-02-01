import { useState, useEffect } from "react"
import Converter from "../utils/converter"
import axios from 'axios'
/* Spell is designed to wrapped in a button but this isnt strictly necessary */

export default function Spell(props) {
    const spellId = props.spellId || 0
    const showCost = props.showCost || false
    const [spellObj, setSpellObj] = useState('')
    const converter = new Converter()

    useEffect(() => {
        getSpell(spellId)
    }, [])

    const getSpell = async (id) => {
        const params = {params: {id: id}}
        const spell = await axios.get('/spell', params)
        setSpellObj(spell.data.spell)
    }

    const costElement = () => {
        if (showCost) {
            return (
                <>
                <label>Cost: {spellObj.goldCost}</label>
                </>
            )
        }
        return (<></>)
    }

    return (
        <div className="spellComponent">
            <div className="spellHeader">
                <h1>{spellObj.name}</h1>
                <div className="spellCost">{costElement()}</div>
            </div>
            <div className="spellClassInfo">
                <div className="spellInfoLeft">
                    <div>Spell Class: {converter.spellClassToString(spellObj.class)}</div>
                    <div>Spell Type: {converter.spellTypeToString(spellObj.type)}</div>
                    <div>Mana Cost: {spellObj.manaCost}</div>
                </div>
                <div className="spellDetailsRight">X = {spellObj.abilityBase} + {spellObj.abilityNumDie}d{spellObj.abilityDie}</div>
            </div>
            <div className="spellDescription">
                <p>{spellObj.description}</p>
            </div>
        </div>
    )
}