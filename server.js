const express = require("express")
const dotenv = require("dotenv")


dotenv.config()
const app = express()
app.use(express.json())

const PORT = process.env.PORT || 5000


const authRouter = require("./src/auth/auth_routes.js")
const devRouter = require("./src/devAPIs/devAPIs.js")

app.use("/api/auth", authRouter)
app.use("/api/dev/", devRouter)

app.get("/", (req, res) => {
    res.json({ message: "Test API is working!"})
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

module.exports = app