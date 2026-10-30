const { db } = require("../prisma/db.ts")
const bcrypt = require("bcrypt")


async function createAdminUser(username, password, email) {
    const hashedPassword = await bcrypt.hash(password, 8)
    try {
        const user = await db.orm.public.User.create({
            email: email,
            name: username,
            password: hashedPassword,
            admin: true
        })
        console.log("Admin User created successfully")
    } catch (e) {
        console.error("Error: ", e)
    }

}

createAdminUser("Zohan Ahmed", "zohan7pro", "ZAhmed@gmail.com")


