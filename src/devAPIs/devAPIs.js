const express = require("express")
const { db } = require("../prisma/db.ts")

const devrouter = express.Router()

devrouter.get("/getUsers", async (req, res) => {
    try {
        const users = await db.orm.public.User.select("id", "name", "email").all()
        res.status(200).json({ users })
    } catch (error) {
        console.error("Error fetching users:", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

devrouter.delete("/deleteUsers", async (req, res) => {
    try{
        await db.orm.public.User.where({ id: "9" }).delete()
        //await db.orm.public.User.deleteAll()
        res.status(200).json({ message: "Deleted" })
    } catch(e) {
        console.error(e)
        res.status(500).json({ message: "Invalid server error" })
    }
})

module.exports = devrouter