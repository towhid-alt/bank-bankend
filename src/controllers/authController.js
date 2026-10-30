

async function authLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token) {
        return res.status(400).json({message: "Logged out successfully"})
    }

    res.cookie("token", "")

    res.status(200).json({message: "User logged out successfully"})
}

module.exports = {authLogoutController}