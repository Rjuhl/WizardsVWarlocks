import CharacterStats from "../components/charcterComponents/characterStats"
import CharacterCustomization from "../components/charcterComponents/characterCustomization"
import Context from "../components/context"
import axios from 'axios'
import { useContext, useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';

export default function CharCreation() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useContext(Context)
    const [userClass, setUserClass] = useState(0)
    const [returnMessage, setReturnMessage] = useState('')
    const classTypes = ["Fire", "Water", "Electric"]

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

        const params = {params:{
            userInfo: userInfo
        }}

        await axios.get("http://localhost:4000/submitprofile", params)
        .then(res => setReturnMessage(handSubmitProfileResponse(res)))
        .catch(e => setReturnMessage(<p className="failure">{e.message}</p>))
    }
    
    return (
        <>
        <div className="charCreationPage">
            <div className="charCreationUserDiv">
                <div className="charCreationUserTopDiv">
                    <h1>{userInfo.username}</h1>
                    <h2>Type: {classTypes[userClass]}</h2>
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