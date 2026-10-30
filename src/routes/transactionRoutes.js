const express = require("express")
const { authSystemUserMiddleware, authMiddleware } = require("../middleware/middlewareAuth.js")
const transactionController = require("../controllers/transactionController.js")

const router = express.Router()
                                                     
router.post("/admin/initial-funds", authSystemUserMiddleware, transactionController.createInitialFundsTransaction)

router.post("/pay", authMiddleware, transactionController.createTransaction)

/** - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction complete
 * 9. Commit MongoDB session
 * 10. Send email notification
 */






module.exports = router
