import CharacterCanvas from "../components/charcterComponents/character"
import { useState } from "react"

export default function Home() {
    const [hatHsva, setHatHsva] = useState({ h: 0, s: 0, v: 68, a: 1 });
    const [staffHsva, setStaffHsva] = useState({ h: 0, s: 0, v: 68, a: 1 });
    return (
        <>
        <h1>home page</h1>
        <CharacterCanvas staffHsva={staffHsva} setStaffHsva={setStaffHsva} hatHsva={hatHsva}  setHatHsva={setHatHsva}/>
        </>
    )
}