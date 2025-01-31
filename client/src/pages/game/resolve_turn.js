import { useState, useEffect, useContext } from "react"
import GameContext from "../../components/providers/gameContext.js";
import {
    Box, 
    CircularProgress, 
    Stack, 
    Typography,
    Divider,
    Button,
} from "@mui/material";
import FavoriteTwoToneIcon from '@mui/icons-material/FavoriteTwoTone';
import BoltTwoToneIcon from '@mui/icons-material/BoltTwoTone';
import { useNavigate } from 'react-router-dom';
import socket from "../../socket.js";
import CharacterCanvas from "../../components/charcterComponents/character.js";
import Spell from "../../components/spell.js";

export default function ResolveTurn() {
    const [gameContext, setGameContext] = useContext(GameContext);
    const [displayReady, setDisplayReady] = useState(false);
    const [damageDelivered, setDamageDelivered] = useState(0);
    const [damageTaken, setDamageTaken] = useState(0);
    const [manaSpent, setManaSpent] = useState(0);
    const [spellCast, setSpellCast] = useState(-1);
    const [foeSpellCast, setFoeSpellCast] = useState(-1);

    // Character consts
    const [hatColor, setHatColor] = useState({h: gameContext.hatColor[0], s: gameContext.hatColor[1], v: gameContext.hatColor[2]})
    const [staffColor, setStaffColor] = useState({h: gameContext.staffColor[0], s: gameContext.staffColor[1], v: gameContext.staffColor[2]})
    const [foeHatColor, setFoeHatColor] = useState({h: gameContext.foeAvatar.hatColor[0], s: gameContext.foeAvatar.hatColor[1], v: gameContext.foeAvatar.hatColor[2]})
    const [foeStaffColor, setFoeStaffColor] = useState({h: gameContext.foeAvatar.staffColor[0], s: gameContext.foeAvatar.staffColor[1], v: gameContext.foeAvatar.staffColor[2]})
    
    //Page Navigate
    const navigate = useNavigate();

    useEffect(() => {
        socket.on('turnResult', playerTurnResponse => {
            console.log(playerTurnResponse);
            if (playerTurnResponse.winner) {
                gameContext["winner"] = playerTurnResponse.winner;
                setGameContext(gameContext);
                navigate('/game-end');
            };

            updateGameContext(playerTurnResponse);
            setDamageDelivered(playerTurnResponse.damageDelivered);
            setDamageTaken(playerTurnResponse.damageTaken);
            setManaSpent(playerTurnResponse.manaSpent);
            setSpellCast(playerTurnResponse.playerMoves[gameContext.username]);
            setFoeSpellCast(playerTurnResponse.playerMoves[gameContext.foeAvatar.player]);
            setDisplayReady(true);
        })

        return () => {
            socket.off('turnResult');
        };
    }, [displayReady]);

    const updateGameContext = (playerTurnResponse) => {
        gameContext.round = playerTurnResponse.turn;
        
        const playerState = playerTurnResponse.playerState;
        if (playerState.observedSpells) gameContext.observedSpells = playerState.observedSpells;
        if (playerState.observedStats) {
            gameContext.foeHealth = playerState.observedStats.health;
            gameContext.foeMana = playerState.observedStats.mana;
        };
        gameContext.frozen = playerState.frozen;
        gameContext.ignited = playerState.ignited > 0;
        gameContext.activeSpells = playerState.spells;
        gameContext.health = playerState.playerStats.health;
        gameContext.mana = playerState.playerStats.mana;

        gameContext.modifers = playerState.modifiers.map((abilityModifer) => ({
            multiplier: abilityModifer.multiplier,
            type: abilityModifer.type,
            role: abilityModifer.role,
            remove: (abilityModifer.removeAfterUse) ? "Remove after use" : "Permanent"
            
        }));

        setGameContext(gameContext)
    }

    const displayDamage = (damage) => {
        return (damage < 0) ? <h1 className="negative-header">{damage}</h1> : <h1 className="positive-header">{`+${damage}`}</h1>;
    }

    const displayResolveTurnPage = () => {  
        if (!displayReady) {
            return (
                <Box 
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                        textAlign: "center",
                        backgroundColor: "#f4f4f4" 
                    }}
                >
                    <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
                        {`${gameContext?.foeAvatar?.player || "opponent"} is still selecting spells`}
                    </Typography>
                    <CircularProgress size={80} sx={{ color: "#007bff" }} />
                    <Typography variant="subtitle1" sx={{ mt: 2, color: "gray" }}>
                        Please wait...
                    </Typography>
                </Box>
            )
        }

        return (
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                sx={{ height: "100vh", textAlign: "center" }} // Ensures full-page centering
            >
                <Stack direction="row">
                    <Stack>
                        <h1 className="medium-header">{gameContext.username}</h1>
                        <CharacterCanvas staffHsva={staffColor} setStaffHsva={setStaffColor} hatHsva={hatColor} setHatHsva={setHatColor} scale={1.25} />
                        <Divider orientation="horizontal" sx={{mx: 3}} flexItem />
                        <Stack direction="row">
                            <FavoriteTwoToneIcon sx={{ fontSize: 60, p: 1, color: 'lightgreen' }} />
                            {displayDamage(damageTaken)}
                            <BoltTwoToneIcon sx={{ fontSize: 60, p: 1, color: 'blue' }} />
                            {displayDamage(manaSpent)}
                        </Stack>
                    </Stack>
                    <Spell key="mySpell" spellId={spellCast} showCost={false} />
                    <Divider orientation="vertical" sx={{mx: 3}} flexItem />
                    <Spell key="foeSpell" spellId={foeSpellCast} showCost={false} />
                    <Stack>
                        <h1 className="medium-header">{gameContext.foeAvatar.player}</h1>
                        <CharacterCanvas canvasId="foeAvatar" staffHsva={foeStaffColor} setStaffHsva={setFoeStaffColor} hatHsva={foeHatColor} setHatHsva={setFoeHatColor} scale={1.25} />
                        <Divider orientation="horizontal" sx={{mx: 3}} flexItem />
                        <Stack direction="row">
                            <FavoriteTwoToneIcon sx={{ fontSize: 60, p: 1, color: 'lightgreen' }} />
                            {displayDamage(damageDelivered)}
                        </Stack>
                    </Stack>
                </Stack>
                <Button 
                    variant="contained"
                    sx={{
                        fontSize: "1.5rem", 
                        padding: "15px 40px", 
                        minWidth: "200px" 
                    }}
                    onClick={() => navigate('/turn-select')}
                >
                    Return to spell selection
                </Button>
            </Stack>    
        )
    }

    return (
        <>{displayResolveTurnPage()}</>
    )
}