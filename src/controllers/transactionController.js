const { json } = require("node:stream/consumers")
const { db } = require("../prisma/db.ts")
const { and } = require("@prisma/orm-postgres/orm-client")


//System or Admin user can only be made true from database because only admin got the access
async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body
}

async function createInitialFundsTransaction(req, res) {
    //to validate if any account is linked with the userid or not, etc.
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencKey are required"
        })
    }

    const toUserAccount = await db.orm.public.Account.where((p) => p.id.eq(toAccount)).first()
    if(!toUserAccount){
        return res.status(400).json({
            message:"Invalid Account"
        })
    }
    console.log("Receiver's account found...")
    console.log("Account Id of sender: ",fromAccount)
    const fromUserAccount = await db.orm.public.Account.where((p) => p.id.eq(fromAccount)).first()
    if(!fromUserAccount){
        return res.status(404).json({
            message: "Account not found"
        })
    }
    console.log("Sender's account found...")
    const user = await db.orm.public.User.where((p) => p.id.eq(fromUserAccount.userId)).first()
    if(!user?.admin){
        return res.status(403).json({mesage: "User is not admin"})
    }
    console.log("Creating transaction...")
    //Transaction
    const result = await db.transaction(async (tx) => {
        const transaction = await db.orm.public.transaction.create({
            fromAccount:fromAccount,
            toAccount:toAccount,
            amount:amount,
            idempotencyKey:idempotencyKey,
            status: "PENDING"         
        })
        const debitLedgerEntry = await db.orm.public.ledger.create({
            account: fromAccount,
            amount: amount,
            transaction: transaction.id,
            type: "DEBIT"
        })
        const creditLedgerEntry = await db.orm.public.ledger.create({
            account: toAccount,
            amount: amount,
            transaction:transaction.id,
            type:"CREDIT",
        })
        await db.orm.public.transaction.update({ status: "COMPLETED" })
        return res.status(201).json({
            message: "Initial funds transaction completed successfully",
            transaction: transaction
        })
    })
}


async function createTransaction(req, res){
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    /**
     * 1. Validate request
     */
    if (!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotency key are required"
        })
    }
    const fromUserAccount = await db.orm.public.Account.where((p) => p.id.eq(fromAccount)).first()

    const toUserAccount = await db.orm.public.Account.where((p) => p.id.eq(toAccount)).first()
    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({message:"From or to account not found"})
    }
    /**
     * 2. Validate idempotency key
     */
    const isTransactionExists = await db.orm.public.transaction.where((p) => p.idempotencyKey.eq(idempotencyKey))
    if(isTransactionExists){
        if(isTransactionExists.status === "COMPLETED"){
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionExists
            })
        }
        if(isTransactionExists.status === "PENDING"){
            return res.status(200).json({message:"PENDING transaction"})
        }
        if(isTransactionExists.status === "FAILED"){
            return res.status(200).json({message:"Previous transaction attempt failed, please try again"})
        }
        if(isTransactionExists.status === "REVERSED"){
            return res.status(200).json({message:"Transaction reversed, please try again"})
        }
    }
    /**
     * 3. Check account status
     */
    if(fromUserAccount.type !== "ACTIVE" || toUserAccount.type !== "ACTIVE"){//FIXME: Code is breaking here
        return res.status(201).json({message:"Both from and to account must be active, to process transaction"})
    }
    /**
     * Derive sender balance from ledger
     */
    const credit = await db.orm.public.ledger.where((p) => and(p.account.eq(fromAccount), p.type.eq("CREDIT"))).
    aggregate((a) => ({ total: a.sum("amount") }))
    
    const debit = await db.orm.public.ledger.where((p) => and(p.account.eq(fromAccount), p.type.eq("DEBIT"))).
    aggregate((a) => ({ total: a.sum("amount") }))

    const balance = (credit.total) - (debit.total)
    if(balance < amount ) {
        res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}`
        })
    }
    /**
     * 5. Create transaction
     */
    const result = await db.transaction(async (tx) => {
        const transaction = await db.orm.public.transaction.create({
            fromAccount:fromAccount,
            toAccount:toAccount,
            amount:amount,
            idempotencyKey:idempotencyKey,
            status: "PENDING"         
        })
        const debitLedgerEntry = await db.orm.public.ledger.create({
            account: fromAccount,
            amount: amount,
            transaction: transaction.id,
            type: "DEBIT"
        })
        const creditLedgerEntry = await db.orm.public.ledger.create({
            account: toAccount,
            amount: amount,
            transaction:transaction.id,
            type:"CREDIT",
        })
        await db.orm.public.transaction.update({ status: "COMPLETED" })
        return res.status(201).json({
            message: "Transaction completed successfully",
            transaction: transaction
        })
    })
    res.status(201).json({message: "Transaction completed successfully", transaction: result})
}


module.exports = {
    createTransaction,
    createInitialFundsTransaction
}