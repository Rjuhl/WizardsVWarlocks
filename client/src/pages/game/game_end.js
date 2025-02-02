import { useContext } from "react";
import GameContext from "../../components/providers/gameContext";
import useNavigationGuard from "../../hooks/useNavigationGuard.js";

export default function GameEnd() {
    const navigate = useNavigationGuard();
    const [gameContext, setGameContext] = useContext(GameContext);

    return (
        <div className="overlay">
            <div className="overlay-content">
                <h1 className="celebration-header">{`${gameContext.winner} wins! 🎉`}</h1>
                <button 
                    className="shop-home-button" 
                    onClick={() => { setGameContext(undefined); navigate("/home"); }}
                >
                    Home
                </button>
            </div>
        </div>
    );
}

