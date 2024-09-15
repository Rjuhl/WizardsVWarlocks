import { useContext, useState } from "react"
import { useNavigate } from 'react-router-dom';
import Context from '../components/context'
import axios from 'axios'

export default function SignIn() {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [accessCode, setAccessCode] = useState('')
    const [adminCode, setAdminCode] = useState('')
    const [returnMessage, setReturnMessage] = useState('')
    const [userInfo, setUserInfo] = useContext(Context)
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault()

        const params = {
            username: username,
            password: password,
            accessCode: accessCode,
            adminCode: adminCode
        }
        await axios.post("http://localhost:4000/signup", params)
        .then(res => setReturnMessage(<p className="success">{res.data}</p>))
        .catch(e => setReturnMessage(<p className="failure">{e.message}</p>))
    }

    const handleLoginIn = async (e) => {
        e.preventDefault()

        const handleLoginResponse = (res) => {
            if (res.status === 201) {
                return <p className="success">{res.data}</p>
            }
            setUserInfo(res.data.user)
            navigate(`/${res.data.route}`)
        }

        const params = {params: {
            username: username,
            password: password
        }}

        await axios.get("http://localhost:4000/login", params)
        .then(res => setReturnMessage(handleLoginResponse(res)))
        .catch(e => setReturnMessage(<p className="failure">{e.message}</p>))
    }

    return(
        <>
        <div className="centerDiv">
            <h1><b>Wizards V Warlocks DEMO</b></h1>
            <form className="accessForm">
                <label>User Name</label>
                <input type="text" id="username" onChange={(e) => setUsername(e.target.value)}></input>
                <label>Password</label>
                <input type="text" id="password" onChange={(e) => setPassword(e.target.value)}></input>
                <label>Access Code</label>
                <input type="text" id="accesscode" onChange={(e) => setAccessCode(e.target.value)}></input>
                <label>Admin Code</label>
                <input type="text" id="admincode" onChange={(e) => setAdminCode(e.target.value)}></input>
                <button type="submit" onClick={handleSignUp}>Sign Up</button>
                <button type="submit" onClick={handleLoginIn}>Login</button>
                <br></br>
                {returnMessage}
            </form>
        </div>
        </>
    )
}