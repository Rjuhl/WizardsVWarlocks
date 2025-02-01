import { useState, useEffect, useContext } from "react"
import { useNavigate } from 'react-router-dom';
import useOnlineStatus from "../hooks/onlineStatus.js"
import Context from '../components/providers/context.js'
import Spell from "../components/spell"
import axios from "axios";
import GameContext from "../components/providers/gameContext.js";
import useNavigationGuard from "../hooks/useNavigationGuard.js"

export default function EquipSpells(props) {
    const numSpellSlots = 6
    const inGame = props.inGame || false
    const [userInfo, setUserInfo] = useContext(Context)
    const [gameContext, setGameContext] = useContext(GameContext)
    const [selectedActiveSpell, setSelectedActiveSpell] = useState(null)
    const [selectedOwnedSpell, setSelectedOwnedSpell] = useState(null)
    const [addButtonVisable, setAddButtonVisable] = useState(false)
    const [removeButtonVisable, setRemoveButtonVisable] = useState(false)
    const [returnMessage, setReturnMessage] = useState('')
    const navigate = useNavigationGuard();
    const [inGameSpells, setInGameSpells] = useState(gameContext.activeSpells)

    useOnlineStatus()

    useEffect(() => {

    }, [])

    const addInGameSpell = (spellId) => {
        if (inGameSpells.length >= numSpellSlots) {
            updateReturnMessage(`Can only have ${numSpellSlots} equiped at a time. Remove one before adding any more`, false)
            return
        }

        if (inGameSpells.includes(spellId)) {
            updateReturnMessage('Spell already equipped', false)
            return
        }

        setSelectedOwnedSpell(null);
        let newInGameSpells = [...inGameSpells, spellId];
        gameContext.newSpells = newInGameSpells;
        setInGameSpells(newInGameSpells);
        setGameContext(gameContext);
        updateReturnMessage("Spell Added", true);
    }

    const removeInGameSpell = (spellId) => {
        if (inGameSpells.length === 0 || !inGameSpells.includes(spellId)) {
            updateReturnMessage("Error, spell cannot be removed", false)
            return
        }
        
        let newInGameSpells = inGameSpells.filter(num => num !== spellId)
        gameContext.newSpells = newInGameSpells;
        setInGameSpells(newInGameSpells);
        setGameContext(gameContext)
        setSelectedActiveSpell(null)
        updateReturnMessage("Spell Removed", true)
    }

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

    const removeSpell = async (spellId) => {
        if (userInfo.activeSpells === 0 || !userInfo.activeSpells.includes(spellId)) {
            updateReturnMessage("Error, spell cannot be removed", false)
            return
        }

        const params = {username:userInfo.username, password:userInfo.password, spellId:spellId}
        const res = await axios.post('/deactivateSpell', params)

        if (res.status === 200) {
            setSelectedActiveSpell(null)
            updateReturnMessage("Spell Removed", true)
            setUserInfo(res.data)
        } else {
            updateReturnMessage(res.data, false)
        }
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
                                    <button className="buy-button" onClick={() => {inGame ? addInGameSpell(spellId) : addSpell(spellId)}}> Add </button>
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
                    { (inGame ? inGameSpells : userInfo.activeSpells).map((spellId, index) =>
                        <div key={index}>
                            <button className="spellForSaleButton" onClick={() => {
                                setSelectedActiveSpell(spellId); setRemoveButtonVisable(true); setReturnMessage('')
                            }}>
                                <Spell key={spellId} spellId={spellId} />
                            </button>
                            <div className="add-button">
                                {removeButtonVisable && selectedActiveSpell === spellId && (
                                    <button className="cancel-button" onClick={() => {inGame ? removeInGameSpell(spellId) : removeSpell(spellId)}}> Remove </button>
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
        <div className="shopRow">
            {!inGame && <button className="shop-home-button" onClick={() => navigate('/home')}>Home</button>}
            <h1 className="shop-title">Equip Spells</h1>
        </div>
        {activeSpells()}
        {ownedSpells()}
        {returnMessage}
        </>
    )
}