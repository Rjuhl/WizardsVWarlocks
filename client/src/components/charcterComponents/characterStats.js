import { Button, Stack } from "@mui/material"
import Context from "../providers/context"
import { useEffect, useContext, useState } from "react"

export default function CharacterStats() {
    const [userInfo, setUserInfo] = useContext(Context)
    const [defaultNumPoints, defaultHealth, defaultMana, defaultClassMultiplier] = [4, 100, 8, 1.0]
    const [pointsLeft, setPointsLeft] = useState(defaultNumPoints)
    const [health, setHealth] = useState(defaultHealth)
    const [mana, setMana] = useState(defaultMana)
    const [classMultiplier, setClassMultiplier] = useState(defaultClassMultiplier)
    const [healthNum, manaNum, classMultiplierNum] = [20, 1, 0.1]
    const healthCap = [defaultHealth + (defaultNumPoints * healthNum)]
    const manaCap = [defaultMana + (defaultNumPoints * manaNum)]
    const classMultiplierCap = [defaultClassMultiplier + (defaultNumPoints * classMultiplierNum)]

    const roundToTenth = (num) => Math.round(num * 10) / 10;

    useEffect(() => {
        updateUserContext()
    }, [health, mana, classMultiplier])

    const updateUserContext = () => {
        userInfo["health"] = health
        userInfo["mana"] = mana
        userInfo["classMultiplier"] = classMultiplier
        setUserInfo(userInfo)
    }

    const onAdd = (stat, setStat, num, cap, base) => {
        if ((pointsLeft <= 0 && num > 0) || (pointsLeft === 4 && num < 0)) { return }
        if (stat >= cap && num > 0) { return }
        if (stat <= base && num < 0) { return }
        setStat(roundToTenth(stat + num))
        num > 0 ? setPointsLeft(pointsLeft - 1) : setPointsLeft(pointsLeft + 1)
    }
    
    const statRow = (text, stat, setStat, num, cap, base) => {
        return (
            <>
            <Stack direction="row"  spacing={1} alignItems="center" >
                <h2 className="medium-header">{text}: {stat}</h2>
                    <Button variant="outlined" onClick={() => onAdd(stat, setStat, num, cap, base)}>+</Button>
                    <Button variant="outlined" onClick={() => onAdd(stat, setStat, -num, cap, base)}>-</Button>
            </Stack>
            </>
        )   
    }
    
    return (
        <Stack 
        spacing={1} 
        justifyContent="center" 
        sx={{ padding: 4 }}
        >
            <h1 className="medium-header">Stats</h1>
            <h2 className="medium-header">Points: {pointsLeft} </h2>
            {statRow("Health", health, setHealth, healthNum, healthCap, defaultHealth)}
            {statRow("Mana", mana, setMana, manaNum, manaCap, defaultMana)}
            {statRow("Class Multiplier", classMultiplier, setClassMultiplier, classMultiplierNum, classMultiplierCap, defaultClassMultiplier)}
        </Stack>
    )
}