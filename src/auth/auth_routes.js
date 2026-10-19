const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { db } = require("../prisma/db.ts")
//import { and, not, or } from "@prisma/orm-postgres/orm-client";
const { and, not, or } = require("@prisma/orm-postgres/orm-client")

const router = express.Router()
//FIXME: email validation not working
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
        console.log("🛑", userExists)
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

        res.status(201).json({ message: "User created successfully", user })
    } catch (error) {
        console.error("Error creating user:", error)
        res.status(500).json({ message: "Internal server error" })
    }
})



module.exports = router