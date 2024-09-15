const express = require('express')
const router = express.Router()
const schemas = require('../models/schemas')
const crypto = require('crypto')
require('dotenv/config')

// router.get('/users', (req, res) => {})
// const schemaExample = new schemas.Users({user:xyzm, ...})
// const saveSchemaExample = await schemaExample.save()


router.post('/signup', async (req, res) => {
    const { username, password, accessCode, adminCode } = req.body;
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

    let admin = false
    if (process.env.ADMIN_CODE === adminCode) {admin = true}

    const newPassword = crypto.createHash('sha1').update(password).digest('hex');
    const newUserData = {username: username, password: newPassword, admin: admin}
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

router.post('/submitprofile', async (req, res) => {
    const user = req.body.userInfo
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

router.post('/addspell', async (req, res) => {
    const spell = req.body
    let success = true
    if (spell.code != process.env.ADMIN_CODE) {
        console.log("no admin access")
        res.send("Must be admin to add spell")
        res.end()
        return
    }

    if (spell.id === -1) {
        const numSpells = await schemas.Spells.countDocuments()
        spell.id = numSpells
        const spellSchema = new schemas.Spells(spell)
        success = await spellSchema.save()
    } else {
        const filter = {id: spell.id}
        success = await schemas.Spells.replaceOne(filter, spell);
    }

    if (success) {
        res.send("Success")
    } else {
        res.send("Failed to create spell. Please try again.")
    }

    res.end()
}) 

router.get('/spell', async (req, res) => {
    const id = req.query.id
    const spell =  await schemas.Spells.where({id: id}).findOne()
    res.send({ spell: spell })
    res.end()
})

axios.post('/buySpell', async (req, res) => {
    const {userId, password, spellId} = req.body
    
})

module.exports = router