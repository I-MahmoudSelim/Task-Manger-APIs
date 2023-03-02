const jwt = require("jsonwebtoken");
// const User = require("../Model/userSchema");
const myError = require("../Model/myError");
const handler = require("./asyncHandler");
const secret = process.env.JWT_SECRET

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");

        const user = jwt.verify(token, secret);
        delete user.iat;
        delete user.exp;

        if (!user) {
            throw new myError(401, "unauthentcated request")
        }
        req.token = token;
        req.user = user;
        next()
    } catch (error) {
        res.status(401).send("unauthentcated request")
    }
}
module.exports = auth;

