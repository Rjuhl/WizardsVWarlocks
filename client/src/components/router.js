import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import SignIn from "../pages/signin"
import Home from "../pages/home"
import CharCreation from "../pages/character_creation"

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
                </Route>
                </Routes>
            </BrowserRouter>
        )
    }
    return(
        <BrowserRoutes />
    )
}