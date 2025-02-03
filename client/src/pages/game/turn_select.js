import { useState, useEffect, useContext } from "react";
import Context from '../../components/providers/context.js'
import GameContext from "../../components/providers/gameContext.js";
import UnknownSpell from "../../components/unknownSpell.js";
import Spell from "../../components/spell.js";
import axios from 'axios';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import FavoriteTwoToneIcon from '@mui/icons-material/FavoriteTwoTone';
import BoltTwoToneIcon from '@mui/icons-material/BoltTwoTone';
import CharacterCanvas from "../../components/charcterComponents/character.js";
import Divider from '@mui/material/Divider';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { Button } from "@mui/material";
import EquipSpells from "../equip_spells.js";
import socket from "../../socket.js";
import Modifier from "../../components/modifer.js";
import useNavigationGuard from "../../hooks/useNavigationGuard.js"

export default function TurnSelect() {
    const SWAP_SPELL_ID = 15;
    const TURN_TIME = 1000 * 60 * 2;
    const [userInfo, setUserInfo] = useContext(Context);
    const [gameContext, setGameContext] = useContext(GameContext);
    const [round, setRound] = useState(gameContext.round);
    const [lastObserved, setLastObserved] = useState(gameContext.lastObserved);
    const [observedSpells, setObservedSpells] = useState(gameContext.observedSpells);
    const [spellEquiped, setSpellEquiped] = useState(-1);
    const [manaSpent, setManaSpent] = useState(0)
    const [slider, setSlider] = useState([1, 0, 10])
    const [reselectSpells, setReselectSpells] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TURN_TIME / 1000);

    // Character consts
    const [hatColor, setHatColor] = useState({h: gameContext.hatColor[0], s: gameContext.hatColor[1], v: gameContext.hatColor[2]})
    const [staffColor, setStaffColor] = useState({h: gameContext.staffColor[0], s: gameContext.staffColor[1], v: gameContext.staffColor[2]})
    const [foeHatColor, setFoeHatColor] = useState({h: gameContext.foeAvatar.hatColor[0], s: gameContext.foeAvatar.hatColor[1], v: gameContext.foeAvatar.hatColor[2]})
    const [foeStaffColor, setFoeStaffColor] = useState({h: gameContext.foeAvatar.staffColor[0], s: gameContext.foeAvatar.staffColor[1], v: gameContext.foeAvatar.staffColor[2]})

    const navigate = useNavigationGuard();
    useEffect(() => {
        socket.on('winner', winner => {
            gameContext["winner"] = winner;
            setGameContext(gameContext);
            navigate('/game-end');
        });

        socket.on('clock', time => {
            setTimeLeft(time);
        });

        // Update manaSpent if there is no slider
        if (slider[1] === slider[2] || slider[0] === 0) {
            setManaSpent(slider[1])
        }

        return () => {
            socket.off('winner');
            socket.off('clock');
        };

    }, [timeLeft, slider, gameContext, reselectSpells]);

    const handleCastSpell = () => {
        if (spellEquiped === -1) return;

        if (spellEquiped === 14) {
            gameContext.lastObserved = gameContext.round + 1
            setGameContext(gameContext)
        }

        socket.emit("makeTurn",
            gameContext.username,
            gameContext.matchRoomNumber,
            spellEquiped,
            manaSpent,
            gameContext.newSpells
        );
        
        navigate("/resolve-turn")

    }

    const setSliderDetails = async (id) => {
        if (id !== -1) {
            const params = {params: {id: id}};
            const spell = (await axios.get('/spell', params)).data.spell;
            if (spell.manaCost === 0) {
                setSlider([0, 0, 0]);
                return;
            };
            const frozenMultiplier = Boolean(gameContext.frozen) ? 2 : 1
            const updatedManaCost = spell.manaCost * frozenMultiplier;
            const spellMaxMana = ((Boolean(spell.flags[1])) ? Math.floor(gameContext.mana / updatedManaCost) * updatedManaCost: updatedManaCost);
            const spellMinMana = ((spellMaxMana >= updatedManaCost) ? updatedManaCost : 0);
            const step = updatedManaCost;
            setManaSpent(spellMinMana);
            setSlider([step, spellMinMana, spellMaxMana]);
        } 
    }

    const activeSpells = () => {
        const activateSpellSelection = (spellId) => {
            if (spellId === SWAP_SPELL_ID) setReselectSpells(true);
        }

        return (
            <div className="shop-spells-container">
                <div className="equip-row">
                    { gameContext.activeSpells.map((spellId, index) =>
                        <div key={index}>
                            <button className="spellForSaleButton" onClick={() => {
                                setSpellEquiped(spellId); setSliderDetails(spellId); activateSpellSelection(spellId);
                            }}>
                                <Spell key={spellId} spellId={spellId} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const contructSlider = ()=> {
        console.log(slider)   
        if (slider[1] === slider[2] || slider[0] === 0) return (<></>);
        return <Slider
            aria-label="Temperature"
            getAriaValueText={valuetext}
            defaultValue={slider[1]}
            valueLabelDisplay="auto"
            shiftStep={30}
            step={slider[0]}
            marks
            min={slider[1]}
            max={slider[2]}
            onChange={(e) => {setManaSpent(e.target.value)}}
            orientation="vertical"
        />
    }

    const valuetext = (value) => {
        return `${value}`;
      }

    return (
        <>
        <p></p>
        <Stack direction="row">
            <div className="spellDisplay">
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 3, 
                    border: '1px solid #ccc', 
                    borderRadius: 1, 
                    width: 'fit-content', 
                }}>
                    <h1 className="medium-header">Selected Spell</h1>
                    <Stack sx={{ height: 200 }} direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 1}} >
                        {spellEquiped === -1 ? <UnknownSpell/> : <Spell key={spellEquiped} spellId={spellEquiped} showCost={false} />}
                        {contructSlider()}
                    </Stack>
                    <p></p>
                    <Button variant="contained" onClick={() => handleCastSpell()}>Cast spell</Button>  
                </Box>
            </div>

            <div className="spellDisplay">
                <Stack 
                    spacing={2}
                    justifyContent="center" 
                    alignItems="center"
                >
                    <h1 className="medium-header">Effects</h1>
                    {Boolean(gameContext.frozen) && <AcUnitIcon sx={{ fontSize: 50, color: "#00BFFF" }} />}
                    {Boolean(gameContext.ignited) && <LocalFireDepartmentIcon sx={{ fontSize: 50, color: "#FF4500" }} />}
                </Stack>
            </div>

            <Box sx={{
                display: 'flex',
                flexDirection: 'column', 
                justifyContent: 'center',
                alignItems: 'center',
                width: 'fit-content', 
            }}>
                <h1 className="medium-header">{gameContext.username}</h1>
                <div className="center-character"><CharacterCanvas staffHsva={staffColor} setStaffHsva={setStaffColor} hatHsva={hatColor} setHatHsva={setHatColor} scale={0.75} /></div>
                <Divider orientation="horizontal" sx={{p: 1}} flexItem />
                <Stack direction="row">
                    <FavoriteTwoToneIcon sx={{ fontSize: 60, p: 1, color: 'lightgreen' }} />
                    <h1 className="medium-header">{gameContext.health}</h1>
                    <BoltTwoToneIcon sx={{ fontSize: 60, p: 1, color: 'blue' }} />
                    <h1 className="medium-header">{gameContext.mana}</h1>
                </Stack>
            </Box>
            <Divider orientation="vertical" sx={{mx: 3}} flexItem />

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: 'fit-content', 
            }}>
                <h1 className="medium-header">{gameContext.foeAvatar.player}</h1>
                <div className="center-character"><CharacterCanvas canvasId="foeAvatar" staffHsva={foeStaffColor} setStaffHsva={setFoeStaffColor} hatHsva={foeHatColor} setHatHsva={setFoeHatColor} scale={0.75} /></div>
                <Divider orientation="horizontal" sx={{p: 1}} flexItem />
                <Stack direction="row">
                    <FavoriteTwoToneIcon sx={{ fontSize: 60, p: 1, color: 'lightgreen' }} />
                    <h1 className="medium-header">{gameContext.foeHealth ? gameContext.foeHealth : '??'}</h1>
                    <BoltTwoToneIcon sx={{ fontSize: 60, p: 1, color: 'blue' }} />
                    <h1 className="medium-header">{gameContext.foeMana ? gameContext.mana : '??'}</h1>
                </Stack>
            </Box>
            <h1>{timeLeft}</h1>
        </Stack>
        
        <h1 className="medium-header">My Spells</h1>
        {activeSpells()}
        <h1 className="medium-header">Observed spells {lastObserved !== 0 ? `from ${round - lastObserved} turns ago` : ''}</h1>
        <div className="shop-spells-container">
            <div className="equip-row">
                { observedSpells.map((spellId, index) =>
                    <div key={index} className="spellDisplay">
                        {spellId === -1 ? <UnknownSpell key={index}/> : <Spell key={index} spellId={spellId} showCost={false} />}
                    </div>
                )}
            </div>
        </div>
        <h1 className="medium-header">Active Modifiers</h1>
        <div className="shop-spells-container">
            <div className="equip-row">
                { gameContext.modifiers.map((modifier, index) =>
                    <div key={index} className="spellDisplay">
                       <Modifier modifier={modifier}/>
                    </div>
                )}
            </div>
        </div>
        <div>
            {reselectSpells && (
                <div className="popup-overlay">
                    <div className="popup">
                        <EquipSpells inGame={true}/>
                        <Button variant="contained" onClick={() => setReselectSpells(false)}>Close</Button>
                    </div>
                </div>
            )}
        </div>
        </>
    )
}