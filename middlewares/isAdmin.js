const User = require("../models/User/User");
const getTokenFromHeader = require("../utils/getTokenFromHeader")
const verifyToken = require("../utils/verifyToken");

const isAdmin = async (req, res, next) => {
    //get token from headers
    const token = getTokenFromHeader(req);
    //verify token
    const decodedUser = verifyToken(token);
    //save the user into req object
    req.userAuth = decodedUser.id;
    const user = await User.findById(req.userAuth);
    if (user.isAdmin) {
        return next();
    } else {
        return res.json({
            message: "Access denied, You are not administrator"
        })
    }
}
module.exports = isAdmin;