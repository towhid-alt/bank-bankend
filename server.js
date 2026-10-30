const express = require("express")
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
const middleware = require("./src/middleware/middlewareAuth.js")

dotenv.config()
const app = express()
app.use(cookieParser())
app.use(express.json())

const PORT = process.env.PORT || 5000
 

const authRouter = require("./src/routes/auth_routes.js")
const devRouter = require("./src/admin/devAPIs.js")
const accountRouter = require("./src/routes/accountRoutes.js")
const transactionRouter = require("./src/routes/transactionRoutes.js")

app.use("/api/auth", authRouter)
app.use("/api/dev/", devRouter)
app.use("/api/accounts", accountRouter)
app.use("/api/transactions", transactionRouter)

app.get("/", (req, res) => {
    res.json({ message: "Test API is working!"})
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

module.exports = app