import { useState, useEffect, useContext } from "react"
import { useNavigate } from 'react-router-dom';
import Context from '../components/context'
import Spell from "../components/spell"
import axios from "axios";

export default function EquipSpells() {
    const numSpellSlots = 6
    const [userInfo, setUserInfo] = useContext(Context)
    const [selectedActiveSpell, setSelectedActiveSpell] = useState(null)
    const [selectedOwnedSpell, setSelectedOwnedSpell] = useState(null)
    const [addButtonVisable, setAddButtonVisable] = useState(false)
    const [removeButtonVisable, setRemoveButtonVisable] = useState(false)
    const [returnMessage, setReturnMessage] = useState('')
    const navigate = useNavigate()

    const updateReturnMessage = (message, success) => {
        if (success) {setReturnMessage(<p className="equip-page-success-message">{message}</p>)}
        else {setReturnMessage(<p className="equip-page-failure-message">{message}</p>)}
    }

    const addSpell = async (spellId) => {
        if (userInfo.activeSpells.length >= numSpellSlots) {
            updateReturnMessage(`Can only have ${numSpellSlots} equiped at a time. Remove one before adding any more`, false)
            return
        }

        const params = {username:userInfo.username, password:userInfo.password, spellId:spellId}
        const res = await axios.post('/setActiveSpell', params)
        if (res.status === 200){
            setSelectedOwnedSpell(null)
            updateReturnMessage("Spell Added", true)
            setUserInfo(res.data)
        } else{
            updateReturnMessage(res.data, false)
        }
    }

    const removeSpell = (spellId) => {
        if (userInfo.activeSpells === 0 || !userInfo.includes(spellId)) {
            updateReturnMessage("Error, spell cannot be removed", false)
            return
        }

        setSelectedActiveSpell(null)
        updateReturnMessage("Spell Removed", true)
    }
    const ownedSpells = () => {
        return (
            <div className="shop-spells-container">
                <h2 className="equip-header">Spells Owned:</h2>
                <div className="equip-row">
                    { userInfo.spellsOwned.map((spellId, index) =>
                        <div key={index}>
                            <button className="spellForSaleButton" onClick={() => {
                                setSelectedOwnedSpell(spellId); setAddButtonVisable(true); setReturnMessage('')}
                            }>
                                <Spell key={spellId} spellId={spellId} />
                            </button>
                            <div className="add-button">
                                {addButtonVisable && selectedOwnedSpell === spellId && (
                                    <button className="buy-button" onClick={() => addSpell(spellId)}> Add </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const activeSpells = () => {
        return (
            <div className="shop-spells-container">
                <h2 className="equip-header">Active Spells:</h2>
                <div className="equip-row">
                    { userInfo.activeSpells.map((spellId, index) =>
                        <div key={index}>
                            <button className="spellForSaleButton" onClick={() => {
                                setSelectedActiveSpell(spellId); setRemoveButtonVisable(true); setReturnMessage('')
                            }}>
                                <Spell key={spellId} spellId={spellId} />
                            </button>
                            <div className="add-button">
                                {removeButtonVisable && selectedActiveSpell === spellId && (
                                    <button className="cancel-button" onClick={() => removeSpell(spellId)}> Remove </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <>
        <div>
            <div className="shopRow">
                <button className="shop-home-button" onClick={() => navigate('/home')}>Home</button>
                <h1 className="shop-title">Equip Spells</h1>
            </div>
            {activeSpells()}
            {ownedSpells()}
            {returnMessage}
        </div>
        </>
    )
}