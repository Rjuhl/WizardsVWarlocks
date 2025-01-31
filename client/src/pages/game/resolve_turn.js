import { useState, useEffect, useContext } from "react"
import GameContext from "../../components/providers/gameContext.js";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import socket from "../../socket.js";

export default function ResolveTurn() {
    const [gameContext, setGameContext] = useContext(GameContext);
    const [displayReady, setDisplayReady] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        socket.on('turnResult', playerTurnResponse => {
            if (playerTurnResponse.winner) {
                gameContext[winner] = playerTurnResponse[winner];
                setGameContext(winner);
                navigate('/game-end');
            };


        })

        return () => {
            socket.off('turnResult');
        };
    }, []);

    const updateGameContext = () => {

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
            <h1>Resolve turn</h1>
        )
    }

    return (
        <>{displayResolveTurnPage()}</>
    )
}