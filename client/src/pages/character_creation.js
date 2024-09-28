import CharacterStats from "../components/charcterComponents/characterStats"
import CharacterCustomization from "../components/charcterComponents/characterCustomization"
import useOnlineStatus from "../hooks/onlineStatus.js"
import Context from "../components/providers/context.js"
import axios from 'axios'
import Converter from "../utils/converter"
import { useContext, useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';

export default function CharCreation() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useContext(Context)
    const [userClass, setUserClass] = useState(0)
    const [returnMessage, setReturnMessage] = useState('')
    const converter = new Converter()

    useOnlineStatus()

    useEffect(() => {
        updateUserContext()
    }, [userClass])

    const updateUserContext = () => {
        userInfo["class"] = userClass
        setUserInfo(userInfo)
    }

    const handSubmitProfileResponse = (res) => {
        if (res.status === 201) {
            return <p className="success">{res.data}</p>
        }
        navigate('/home') 
    }

    const submitProfile = async (e) => {
        e.preventDefault()

        const params = {
            userInfo: userInfo
        }

        await axios.post("http://localhost:4000/submitprofile", params)
        .then(res => setReturnMessage(handSubmitProfileResponse(res)))
        .catch(e => setReturnMessage(<p className="failure">{e.message}</p>))
    }
    
    return (
        <>
        <div className="charCreationPage">
            <div className="charCreationUserDiv">
                <div className="charCreationUserTopDiv">
                    <h1>{userInfo.username}</h1>
                    <h2>Type: {converter.spellClassToString(userClass)}</h2>
                    <div className="charCreationRowDiv">
                        <button onClick={() => setUserClass(0)}>Fire</button>
                        <button onClick={() => setUserClass(1)}>Water</button>
                        <button onClick={() => setUserClass(2)}>Electric</button>
                    </div>
                    <button onClick={submitProfile}>Finished Customization</button>
                    {returnMessage}
                </div>
                <div className="charCreationUserBottomDiv">
                    <CharacterStats />
                </div>
            </div>
            <CharacterCustomization />
        </div>
        </>
    )
}