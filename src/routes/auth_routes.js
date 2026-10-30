const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { db } = require("../prisma/db.ts")
//import { and, not, or } from "@prisma/orm-postgres/orm-client";
const { and, not, or } = require("@prisma/orm-postgres/orm-client")
const emailService = require("../services/emailService.js")
const { createAccountController } = require("../controllers/accountController.js")

const router = express.Router()
const loggedInUsers = []
router.post("/register", async (req, res) => {
    const { email, username, password } = req.body
    try {
        const emailRegex = /^[^\s.@]+@[^\s.@]+\.[^\s.@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password should be atleast 6 characters long" })
        }
        const hashedPassword = await bcrypt.hash(password, 8)

        const userExists = await db.orm.public.User.where((p) => or(p.email.ilike(email), p.name.ilike(username))).first()
        if (userExists) {
            return res.status(400).json({ message: "User already exists" })
        }
        const user = await db.orm.public.User.create({
            email: email,
            name: username,
            password: hashedPassword
        })

        //Create a JWT token for the user
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })

        res.cookie("token", token)
        //Creating account by default during registration
        console.log("Creating account for user")
        const account = await db.orm.public.Account.create({
            userId: user.id
        })
        res.status(201).json({ message: "User created successfully", user })

        //await emailService.sendRegistrationEmail(user.email, user.name)//FIXME: Function disabled for debugging
    } catch (error) {
        console.error("Error creating user:", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.post("/login", async (req, res) => {
    const { username, password } = req.body
    //const token = req.headers.authorization?.split(' ')[1]
    try {
        const user = await db.orm.public.User.where((p) => p.name.ilike(username)).first()
        if (!user) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }
        const pwMatch = bcrypt.compare(password, user.password)
        if (!pwMatch) {
            return res.status(400).json({ message: "Invalid username or password" })
        }
        //Create a JWT token for the user
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.cookie("token", token)
        loggedInUsers.push(username)
        console.log("Logged In Users: ",loggedInUsers)
        res.status(200).json({ message: "Login Successful", user })
    } catch (e) {
        console.error(e)
        res.status(500).json({ message: "Internal server error" })
    }
})



module.exports = router