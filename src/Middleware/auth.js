const jwt = require("jsonwebtoken");
// const User = require("../Model/userSchema");
const myError = require("../Model/myError");
const handler = require("./asyncHandler");
const secret = process.env.JWT_SECRET

const auth = handler(async (req, res, next) => {

    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        // const decoded = jwt.verify(token, secret);
        const user = jwt.verify(token, secret);
        delete user.iat;
        delete user.exp;
        // const user = await User.findOne({ _id: decoded._id, "tokens.token": token })

        if (!user) {
            throw new myError(401, "unauthentcated request")
        }
        req.token = token;
        req.user = user;
        next()
    } catch {
        throw new myError(401, "unauthentcated request")
    }
})
module.exports = auth;