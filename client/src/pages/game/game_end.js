import { useNavigate } from "react-router-dom";
import GameContext from "../../components/providers/gameContext";
import { useContext } from "react";

export default function GameEnd() {
    const navigate = useNavigate();
    const [gameContext, setGameContext] = useContext(GameContext);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            textAlign: "center"
        }}>
            <h1 className="celebration-header">{`${gameContext.winner} wins! 🎉`}</h1>
            <button className="shop-home-button" onClick={() => {setGameContext(undefined); navigate("/home");}}>Home </button>
        </div>
    );
}
