const express = require("express")
const { authMiddleware } = require("../middleware/middlewareAuth.js")
const {getAccountBalanceController, getUserAccountController, createAccountController} = require("../controllers/accountController.js")

const router = express.Router()

router.post("/", authMiddleware, createAccountController)//creates account

/**
 * -GET /api/account
 * -GET all accounts of the logged-in user
 * -Protected Route
 */
router.get("/", authMiddleware,getUserAccountController)
router.get("/balance/:accountId", authMiddleware, getAccountBalanceController)

module.exports = router