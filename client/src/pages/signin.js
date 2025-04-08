import { useContext, useState } from "react"
import { useNavigate } from 'react-router-dom';
import useOnlineStatus from "../hooks/onlineStatus.js"
import Context from '../components/providers/context.js'
import axios from 'axios'
import { Box, Stack, TextField, Button, Typography, Paper } from "@mui/material";

export default function SignIn() {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [accessCode, setAccessCode] = useState('')
    const [adminCode, setAdminCode] = useState('')
    const [returnMessage, setReturnMessage] = useState('')
    const [userInfo, setUserInfo] = useContext(Context)
    const navigate = useNavigate();

    useOnlineStatus()

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

    return (
        <Box 
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          sx={{ 
            backgroundColor: "#f5f5f5", 
            backgroundImage: "url('/transparentwizard.png')", // Adjust path
            backgroundSize: "40%", // Ensures the full image is visible
            backgroundPosition: "left center", // Positions image to the center-left
            backgroundRepeat: "no-repeat" // Prevents tiling
          }}// Light gray background, or remove this line for no background
        >
          <Paper 
            elevation={4} // Subtle shadow instead of a background color
            sx={{
              padding: 4,
              borderRadius: 3,
              maxWidth: 400,
              width: "100%",
              textAlign: "center",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Soft shadow
              backgroundColor: "white", // Neutral, no color form
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Wizards V Warlocks DEMO
            </Typography>
            
            <Stack spacing={2} component="form">
              <TextField 
                label="User Name" 
                variant="outlined" 
                fullWidth
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField 
                label="Password" 
                type="password"
                variant="outlined" 
                fullWidth
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField 
                label="Access Code" 
                variant="outlined" 
                fullWidth
                onChange={(e) => setAccessCode(e.target.value)}
              />
              <TextField 
                label="Admin Code" 
                variant="outlined" 
                fullWidth
                onChange={(e) => setAdminCode(e.target.value)}
              />
    
              {/* Buttons Row */}
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={handleSignUp}
                >
                  Sign Up
                </Button>
                <Button 
                  variant="contained" 

                  fullWidth 
                  onClick={handleLoginIn}
                >
                  Login
                </Button>
              </Stack>
    
              {/* Return Message Display */}
              {returnMessage && (
                <Typography color="error" variant="body2">
                  {returnMessage}
                </Typography>
              )}
            </Stack>
          </Paper>
        </Box>
      );
    };