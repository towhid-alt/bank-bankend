const express = require("express")
const { db } = require("../prisma/db.ts")
const { and } = require("@prisma/orm-postgres/orm-client")

async function createAccountController(req, res) {
    console.log("Inside createAccountController...")
    const user = req.user

    try {
        const account = await db.orm.public.Account.create({
            userId: user.id
        })

        res.status(201).json({ account })
    } catch (e) {
        res.status(501).json({ message: "Error creating account" })
    }
}

async function getUserAccountController(req, res) {
    const accounts = await db.orm.public.Account.where((p) => p.userId.eq(req.id))
    res.status(200).json({
        accounts
    })
}

async function getAccountBalanceController(req, res) {
    const { accountId } = req.params;

    const account = await db.orm.public.Account.where((p) => and(p.id.eq(accountId), p.userId.eq(req.userId)))

    if (!account) {
        res.status(404).json({ message: "Account not found" })
    }
    /**
         * Derive sender balance from ledger
         */
    const credit = await db.orm.public.ledger.where((p) => and(p.account.eq(accountId), p.type.eq("CREDIT"))).
        aggregate((a) => ({ total: a.sum("amount") }))

    const debit = await db.orm.public.ledger.where((p) => and(p.account.eq(accountId), p.type.eq("DEBIT"))).
        aggregate((a) => ({ total: a.sum("amount") }))

    const balance = (credit.total) - (debit.total)
    res.status(200).json({
        accountId: accountId,
        balance: balance
    })
}
module.exports = { createAccountController, getUserAccountController, getAccountBalanceController}