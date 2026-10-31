# Bank ledger server

This is an Express backend for ledger accounts, user authentication, and account-to-account transactions. The principal workflow is registration/login, authenticated account access, then a transfer that validates accounts and idempotency, derives balance from ledger entries, and records transaction and ledger rows.

### API Base URL - [Bank ledger backend](https://bank-bankend-ggx0.onrender.com)

## Project overview

<p align="center">
  <img src="images/overview.png" width="600">
</p>

## Tech Stack

-  NodeJS
-  Prisma ORM
