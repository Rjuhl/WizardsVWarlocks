import { useState, useEffect, useContext } from "react"
import { useNavigate } from 'react-router-dom';
import Context from '../components/providers/context.js'
import CharacterCanvas from "../components/charcterComponents/character"
import rgbtohsv from "../utils/rgbtohsv";
import Converter from "../utils/converter";
import useOnlineStatus from "../hooks/onlineStatus.js"
import socket from '../socket'

// const [hatHsva, setHatHsva] = useState({ h: 0, s: 0, v: 68, a: 1 });
// const [staffHsva, setStaffHsva] = useState({ h: 0, s: 0, v: 68, a: 1 });
// <CharacterCanvas staffHsva={staffHsva} setStaffHsva={setStaffHsva} hatHsva={hatHsva}  setHatHsva={setHatHsva}/>

export default function Home() {
    const [userInfo, setUserInfo] = useContext(Context)
    const [hatColor, setHatColor] = useState({h: userInfo.hatColor[0], s: userInfo.hatColor[1], v: userInfo.hatColor[2]})
    const [money, setMoney] = useState(userInfo.money)
    const [staffColor, setStaffColor] = useState({h: userInfo.staffColor[0], s: userInfo.staffColor[1], v: userInfo.staffColor[2]})
    const [health, mana, classMultiplier] = [userInfo.health, userInfo.mana, userInfo.classMultiplier]
    const [challenge, setChallenge] = useState('None')
    const [challengeMessage, setChallengeMessage] = useState(null)
    const [onlineList, setOnlineList] = useState([])
    const classType = userInfo.class
    const userName = userInfo.username
    const admin = userInfo.admin || false
    const navigate = useNavigate();
    const converter = new Converter()
    
    useOnlineStatus();

    socket.on('onlineUserListUpdate', onlineUserList => {
        console.log(onlineUserList)
        setOnlineList(onlineUserList)
    })

    useEffect(() => {

        // Listen for the online user list updates
        socket.on('onlineUserListUpdate', onlineUserList => {
            console.log('Online users updated:', onlineUserList);
            setOnlineList(onlineUserList);
        });

        // Clean up event listeners on unmount
        return () => {
            socket.off('onlineUserListUpdate');
        }
    }, [onlineList])

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
        setChallenge(username)
        const message = username === 'None' ? null : username
        setChallengeMessage(message)
    }


    return (
        <>
            {adminPage()}
            <div className="homePage">
                <div className="homePageLeft">
                    <div className="content">
                        <p className="homePageUsername">{userName}</p>
                        <CharacterCanvas staffHsva={staffColor} setStaffHsva={setStaffColor} hatHsva={hatColor} setHatHsva={setHatColor} scale={0.75} />
                        <h1>Class Type: {converter.spellClassToString(classType)} </h1>
                        <div className="homePageRow">
                            <h2>Health: {health}</h2>
                            <h2>Gold: {money}</h2>
                        </div>
                        <div className="homePageRow">
                            <h2>Class Multiplier: {classMultiplier}</h2>
                            <h2>Mana: {mana}</h2>
                        </div>
                    </div>
                    <div className="challenge-section">
                        <button onClick={() => {navigate('/shop')}}>Shop</button>
                        <button onClick={() => {navigate('/equipspells')}}>Equip Spells</button>
                        <h1>Current Challenge:</h1>
                        <h2>{challenge}</h2>
                        <button onClick={() => updateChallenge('None')}>Clear Challenge</button>
                    </div>
                </div>

                {/* New User List Section */}
                <div className="userListSection">
                    <h2>Online Users</h2>
                    {challengeMessage !== null && (
                        <p style={{ color: 'green' }}>
                        {challengeMessage} challenged!
                        </p>
                    )}
                    <div className="userList">
                        {onlineList.filter((user) => user !== userInfo.username).map((user, index) => (
                            <button
                                key={user}
                                className={`userRow ${index % 2 === 0 ? 'evenRow' : 'oddRow'}`}
                                onClick={() => updateChallenge(user)}
                            >
                                {user}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}