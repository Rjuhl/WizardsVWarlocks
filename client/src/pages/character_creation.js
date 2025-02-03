import CharacterStats from "../components/charcterComponents/characterStats"
import CharacterCustomization from "../components/charcterComponents/characterCustomization"
import useOnlineStatus from "../hooks/onlineStatus.js"
import Context from "../components/providers/context.js"
import axios from 'axios'
import Converter from "../utils/converter"
import { useContext, useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import useNavigationGuard from "../hooks/useNavigationGuard.js"
import { Button, Stack } from "@mui/material"


export default function CharCreation() {
    const navigate = useNavigationGuard();
    const [userInfo, setUserInfo] = useContext(Context)
    const [userClass, setUserClass] = useState(0)
    const [returnMessage, setReturnMessage] = useState('')
    const converter = new Converter()

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
               
                    <Stack 
                    spacing={1} 
                    justifyContent="center" 
                    sx={{ padding: 4 }}
                    >
                    <h1 className="medium-header">{userInfo.username}</h1>
                    <h2 className="medium-header">Type: {converter.spellClassToString(userClass)}</h2>
                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" onClick={() => setUserClass(0)}>Fire</Button>
                        <Button variant="outlined" onClick={() => setUserClass(1)}>Water</Button>
                        <Button variant="outlined" onClick={() => setUserClass(2)}>Electric</Button>
                    </Stack>
                    <Button variant="contained" onClick={submitProfile}>Finished Customization</Button>
                    {returnMessage}
                    </Stack>
                    
               
                <div className="charCreationUserBottomDiv">
                    <CharacterStats />
                </div>
            </div>
            <CharacterCustomization />
        </div>
        </>
    )
}