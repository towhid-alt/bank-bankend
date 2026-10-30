const jwt = require("jsonwebtoken")
const { db } = require("../prisma/db.ts")
const { and, not, or } = require("@prisma/orm-postgres/orm-client")


async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.aplit(' ')[1]

    if (!token) {
        return res.status(401).json({ message: "Unauthorized access, token is invalid" })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await db.orm.public.User.where((p) => p.id.eq(decoded.id)).first()

        req.user = user

        next()

    } catch (e) {
        res.status(500).json({ message: "Unauthorized access, token is invalid" })
    }
}

async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    console.log("authSystemMiddleware running...")
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log("token verified...")
        const user = await db.orm.public.User.where((p) => and(p.id.eq(decoded.id), p.admin.eq(true))).first()//FIXME:code is breaking here
        if (!user.admin) {
            return res.status(403).json({
                message: "Forbidden access, not a system user"
            })
        }
        console.log("System user verification POSITIVE")
        next()
    } catch (e) {
        return res.status(402).json({
            message: "Unauthorized access, token is invalid"
        })
    }
}

module.exports = { authMiddleware, authSystemUserMiddleware }

