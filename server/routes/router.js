const express = require('express')
const router = express.Router()
const schemas = require('../models/schemas')
const crypto = require('crypto')
require('dotenv/config')

// router.get('/users', (req, res) => {})
// const schemaExample = new schemas.Users({user:xyzm, ...})
// const saveSchemaExample = await schemaExample.save()


router.get('/signup', async (req, res) => {
    const { username, password, accessCode } = req.query;
    if (process.env.ACCESS_CODE != accessCode){
        res.send("Access code is incorrect")
        res.end()
        return
    }

    const duplicate_username = await schemas.Users.where({username: username}).findOne()
    if (duplicate_username != null) {
        res.send("Username is taken. Use a different one")
        res.end()
        return
    }

    const newPassword = crypto.createHash('sha1').update(password).digest('hex');
    const newUserData = {username: username, password: newPassword}
    const newUser = new schemas.Users(newUserData)
    const saveUser = await newUser.save()

    if (saveUser) {
        res.send(`User ${username} created. Please login`)
    } else {
        res.send("Failed to save user profile. Please try again.")
    }

    res.end()
})

router.get('/login', async (req, res) => {
    const {username, password} = req.query
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    const userData = {username: username, password: hashedPassword}
    userContext = await schemas.Users.where(userData).findOne()

    if (userContext === null) {
        res.status(201)
        res.send("Login or password incorrect")
        res.end()
        return
    }

    if (userContext.class === -1){
        res.send({route: "charcreation", user: userContext})
    } else{
        res.send({route: "home", user: userContext})
    }

    res.end()
})

router.get('/submitprofile', async (req, res) => {
    const user = req.query.userInfo
    const totalPoints = 4
    const [healthIncrement, manaIncrement, classMultiplierIncrement] = [20, 1, 0.1]
    const [baseHealth, baseMana, baseClassMultiplier] = [100, 8, 1.0]
    const filter = {username: user.username}
    
    const verifyAttributePoints = (userInfo) => {
        const [health, mana, classMultiplier] = [userInfo.health, userInfo.mana, userInfo.classMultiplier]

        if (health < baseHealth || mana < baseMana || classMultiplier < baseClassMultiplier) { return false }

        if (
            health > baseHealth + (totalPoints * healthIncrement) ||
            mana > baseMana + (totalPoints * manaIncrement) ||
            classMultiplier > baseClassMultiplier+ (totalPoints * classMultiplierIncrement)
        ) { return false }
        
        const pointsUsed = (value, base, increment) => {
           const points = Math.ceil((((value - base) / increment) * 10000) / 10000)
           return points > 0 ? points : 0
        }

        if (
            pointsUsed(health, baseHealth, healthIncrement) + 
            pointsUsed(mana, baseMana, manaIncrement) + 
            pointsUsed(classMultiplier, baseClassMultiplier, classMultiplierIncrement) > 4
        ) { return false }

        return true
    }

    if (!verifyAttributePoints(user)) {
        res.status(201)
        res.send("!!!Invalid Character Values!!!")
        res.end()
    }

    const result = await schemas.Users.replaceOne(filter, user);
    res.send("success")
    res.end()
})

module.exports = router