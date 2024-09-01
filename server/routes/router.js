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

module.exports = router