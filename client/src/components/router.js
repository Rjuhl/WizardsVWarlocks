import { BrowserRouter, Routes, Route, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react';
import SignIn from "../pages/signin"
import Home from "../pages/home"
import CharCreation from "../pages/character_creation"
import Shop from '../pages/shop'
import AdminPage from '../pages/admin_page'
import EquipSpells from '../pages/equip_spells'
import TurnSelect from '../pages/game/turn_select'
import GameEnd from '../pages/game/game_end';
import ResolveTurn from '../pages/game/resolve_turn';

export default function Router() {
    // Can use layout to add components to every page (ie footer/header). The rest is put into outlet
    const Layout = () => {
        return (
            <>
            <Outlet />
            </>
        )
    }

    const BrowserRoutes = () => {
        return (
            <BrowserRouter>
                <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="/" element={<SignIn />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/charcreation" element={<CharCreation />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/adminpage" element={<AdminPage />} />
                    <Route path="/equipspells" element={<EquipSpells />} />
                    <Route path="/turn-select" element={<TurnSelect />} />
                    <Route path="/game-end" element={<GameEnd />} />
                    <Route path="/resolve-turn" element={<ResolveTurn />} />
                </Route>
                </Routes>
            </BrowserRouter>
        )
    }
    return(
        <BrowserRoutes />
    )
}