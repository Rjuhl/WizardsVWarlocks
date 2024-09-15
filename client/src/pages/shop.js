import { useState, useEffect, useContext } from "react"
import { useNavigate } from 'react-router-dom';
import Spell from "../components/spell"
import Context from '../components/context'
import axios from 'axios'


export default function Shop() {
    const numSpells = 7
    const numRows = 2
    const [selectedSpell, setSelectedSpell] = useState(null)
    const [buttonsVisable, setButtonsVisable] = useState(false)
    const [userInfo, setUserInfo] = useContext(Context)
    const navigate = useNavigate();

    const getSpellPartitions = () => {
        let spellPartition = []
        let currentSpellRow = []
        const spellsInRow = Math.ceil(numSpells / numRows)
        for (let i = 0; i < numSpells; i++) {
            if (currentSpellRow.length === spellsInRow) {
                spellPartition.push(currentSpellRow)
                currentSpellRow = []
            }
            currentSpellRow.push(i)
        }
        
        if (spellPartition.length > 0) {spellPartition.push(currentSpellRow)}
        return spellPartition
    }

    const selectSpell = (spellId) => {
        setSelectedSpell(spellId)
        setButtonsVisable(true)
    }

    const getSpellCost = async (spellId) => {
        const spell = await axios.get('/spell', {params: {id: spellId}})
        .catch(e => console.log(e))
        const price = spell.data.spell.goldCost
        return price
    }

    const buySpell = async (spellId) => {
        const spellCost = await getSpellCost(spellId)
        if (spellCost > userInfo.money) {
            alert("You do not have enough gold to purchase this spell")
        } else {
            const params = {userId:userInfo.id, password:userInfo.password, spellId:spellId}
            await axios.post('buySpell', params)
        }

        setSelectedSpell(null)
        setButtonsVisable(false)
    }

    const unselectSpell = () => {
        setSelectedSpell(null)
        setButtonsVisable(false)
    }


    const spellButton = (spellId, index) => {
        return (
            <div key={index} className="spellForSale">
              <button className="spellForSaleButton" onClick={() => selectSpell(spellId)}>
                <Spell key={spellId} spellId={spellId} showCost={true} />
              </button>
              {buttonsVisable && selectedSpell === spellId && (
                <div className="spawned-buttons-container">
                    <div className="spawned-buttons">
                        <button className="buy-button" onClick={() => buySpell(spellId)}> Buy </button>
                        <button className="cancel-button" onClick={() => unselectSpell()}> X </button>
                    </div>
                </div>
              )}
            </div>
          )
    }

    const displaySpells = () => {
        const spellPartition = getSpellPartitions()
        return (
            <div className="shop-spells-container">
                {spellPartition.map((spells, index) => 
                    <div key={index} className="spell-row">
                        {spells.map((spell, index) => spellButton(spell, index))}
                    </div>
                )}
            </div>
        )
    }


    return (
        <>
        <div className="shopRow">
            <button className="shop-home-button" onClick={() => navigate('/home')}>Home</button>
            <h1 className="shop-title">Shop</h1>
            <h2 className="shop-gold-cost">Gold: {userInfo.money}</h2>
        </div>
        {displaySpells()}
        </>
    )
}