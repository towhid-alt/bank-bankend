const express = require("express")
const { db } = require("../prisma/db.ts")
const bcrypt = require("bcrypt")

const devrouter = express.Router()

devrouter.get("/getUsers", async (req, res) => {
    try {
        const users = await db.orm.public.User.select("id", "name", "email", "admin").all()
        res.status(200).json({ users })
    } catch (error) {
        console.error("Error fetching users:", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

devrouter.delete("/deleteUsers", async (req, res) => {
    try {
        await db.orm.public.User.where({ id: "24" }).delete()
        //await db.orm.public.User.deleteAll()
        res.status(200).json({ message: "Deleted" })
    } catch (e) {
        console.error(e)
        res.status(500).json({ message: "Invalid server error" })
    }
})

devrouter.get("/getAccounts", async (req, res) => {
    try {
        const accounts = await db.orm.public.Account.select("id", "userId", "type", "createdAt").
        include("user", (user) => user.select("name","admin")).all()
        res.status(200).json({ accounts })
    } catch (e) {
        res.status(500).json({ message: "Invalid Server Error" })
    }
})

devrouter.delete("/deleteAll", async (req, res) => {
    try {
        const accounts = await db.orm.public.Account.deleteAll()

        const users = await db.orm.public.User.deleteAll()
        res.status(201).json({ message: "All Users and Accounts deleted" })
    } catch (e) {
        res.status(502).json({ message: "Error erasing data" })
        console.log(e)
    }
})

devrouter.post("/admin", async(req,res) => {
    const {email, username, password}  = req.body
    try{
        const hashedPassword = await bcrypt.hash(password, 8)
        const user = await db.orm.public.User.create({
            email: email,
            name: username,
            password: hashedPassword,
            admin: "true"
        })
                console.log("Admin User created successfully")

         const account = await db.orm.public.Account.create({
            userId: user.id
        })
        console.log("Admin User bank account created")
        res.status(201).json({message:"Admin User created successfully"})
    }catch (e) {
        res.status(503).json({message:"Error creating Admin User"})
        console.error("Error: ", e)
    }
})

module.exports = devrouter