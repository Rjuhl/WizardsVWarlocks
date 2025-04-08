import { useState, useEffect, useContext, useReducer } from "react"
import { useNavigate } from 'react-router-dom';
import Context from '../components/providers/context.js'
import CharacterCanvas from "../components/charcterComponents/character"
import GameContext from "../components/providers/gameContext.js";
import Converter from "../utils/converter";
import useOnlineStatus from "../hooks/onlineStatus.js"
import socket from '../socket'
import axios from 'axios'
import useNavigationGuard from "../hooks/useNavigationGuard.js"
import { Button, Stack } from "@mui/material";

// const [hatHsva, setHatHsva] = useState({ h: 0, s: 0, v: 68, a: 1 });
// const [staffHsva, setStaffHsva] = useState({ h: 0, s: 0, v: 68, a: 1 });
// <CharacterCanvas staffHsva={staffHsva} setStaffHsva={setStaffHsva} hatHsva={hatHsva}  setHatHsva={setHatHsva}/>

export default function Home() {
    const [userInfo, setUserInfo] = useContext(Context);
    const [gameContext, setGameContext] = useContext(GameContext);
    const [hatColor, setHatColor] = useState({h: userInfo.hatColor[0], s: userInfo.hatColor[1], v: userInfo.hatColor[2]})
    const [money, setMoney] = useState(userInfo.money)
    const [staffColor, setStaffColor] = useState({h: userInfo.staffColor[0], s: userInfo.staffColor[1], v: userInfo.staffColor[2]})
    const [health, mana, classMultiplier] = [userInfo.health, userInfo.mana, userInfo.classMultiplier]
    const [challenge, setChallenge] = useState('None')
    const [challengeMessage, setChallengeMessage] = useState(null)
    const [onlineList, setOnlineList] = useState([])
    const [challengers, setChallengers] = useState([]);
    const classType = userInfo.class
    const userName = userInfo.username
    const admin = userInfo.admin || false
    const navigate = useNavigationGuard();
    const converter = new Converter()
    
    useOnlineStatus();
    useEffect(() => {

        // Listen for the online user list updates
        socket.on('onlineUserListUpdate', onlineUserList => {
            console.log('Online users updated:', onlineUserList);
            setOnlineList(onlineUserList);
        });

        //Listen for challenges 
        socket.on('challengersUpdate', challengersList => {
            console.log("Challengers List", challengersList);
            setChallengers(challengersList);
        })

        // Listen for match and room number
        socket.on("matchRoom", async (roomNumber) => {
            const params = {params: {username: challengeMessage}}; 
            const foeAvatar = await axios.get("http://localhost:4000/playerAvatar", params)
            .then(res => { return res.data})
            .catch(e => {console.log(e)});
            const info =

            setGameContext({
                ...userInfo,
                activeSpells: userInfo.activeSpells,
                matchRoomNumber: roomNumber,
                foeAvatar: foeAvatar,
                observedSpells: Array(userInfo.activeSpells.length).fill(-1),
                round: 0,
                lastObserved: 0,
                newSpells: null,
                foeHealth: null,
                foeMana: null,
                winner: null,
                frozen: false,
                ignited: false,
                modifiers: [
                    {
                        multiplier: userInfo.classMultiplier,
                        type: userInfo.class,
                        role: 6,
                        active: "Permanent"
                    }
                ]

            });
            navigate('/turn-select');
        });

        socket.emit('getUserList');
        socket.emit('getChallengersList', userInfo.username);

        // Clean up event listeners on unmount
        return () => {
            socket.off('onlineUserListUpdate');
            socket.off('challengersUpdate');
            socket.off('matchRoom');
        }
    }, [challenge])

    const adminPage = () => {
        if (admin) {
            return (
                <button onClick={() => navigate('/adminpage')}>Admin Page</button>
            )
        }
        return <></>
    }

    const updateChallenge = (username) => {
        // Emit Challenge
        if (challengeMessage !== 'None') socket.emit('cancelChallenge', userInfo.username, challengeMessage);
        socket.emit('challenge', userInfo.username, username);

        setChallenge(username)
        const message = username === 'None' ? null : username
        setChallengeMessage(message)
    }


    return (
        <>
            {adminPage()}
            <div className="homePage">
            {/* Left Panel - Character & Stats */}
            <div className="leftPanel">
                <div className="characterSection">
                    <p className="userName">{userName}</p>
                    <CharacterCanvas 
                        staffHsva={staffColor} 
                        setStaffHsva={setStaffColor} 
                        hatHsva={hatColor} 
                        setHatHsva={setHatColor} 
                        scale={0.75} 
                    />
                    <h2 className="classType">Class: {converter.spellClassToString(classType)}</h2>
                </div>

                <div className="statsGrid">
                    <div className="stat"><h3>Health</h3><p>{health}</p></div>
                    <div className="stat"><h3>Gold</h3><p>{money}</p></div>
                    <div className="stat"><h3>Mana</h3><p>{mana}</p></div>
                    <div className="stat"><h3>Class Multiplier</h3><p>{classMultiplier}</p></div>
                </div>
            </div>

            {/* Middle Panel - Challenge Section */}
            <div className="middlePanel">
                <h2 className="sectionTitle">🏆 Challenge</h2>
                <p className="challengeText">{challenge || "No active challenge"}</p>
                {/* Buttons */}
                <Stack spacing={2}>
                    <Button variant="outlined" onClick={() => navigate('/shop')}>Visit Shop</Button>
                    <Button variant="outlined" onClick={() => navigate('/equipspells')}>Equip Spells</Button>
                    <Button variant="contained" className="button" onClick={() => updateChallenge('None')}>Clear Challenge</Button>
                </Stack>
            </div>

            {/* Right Panel - Online Users & Challengers */}
            <div className="rightPanel">
                <div className="userListContainer">
                    <h2 className="sectionTitle">🌐 Online Users</h2>
                    {challengeMessage && <p className="successMessage">{challengeMessage} challenged!</p>}
                    <div className="userList">
                        {onlineList.filter(user => user !== userInfo.username).map((user, index) => (
                            <button key={user} className="userButton" onClick={() => updateChallenge(user)}>
                                {user}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="userListContainer">
                    <h2 className="sectionTitle">⚔️ Challengers</h2>
                    <div className="userList">
                        {challengers.map((user, index) => (
                            <button key={user} className="userButton" onClick={() => updateChallenge(user)}>
                                {user}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <img 
        src="/dragon.png" 
        alt="Wizard" 
        style={{
            position: "fixed",
            bottom: "10%",
            right: "10%",
            width: "30%",
            height: "auto",
            zIndex: -1
        }} 
        />
        </>
    );
}


