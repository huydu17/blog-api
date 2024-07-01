const getTokenFromHeader = require("../utils/getTokenFromHeader")
const verifyToken = require("../utils/verifyToken");
const isLogin = (req, res, next) => {
    //get token from headers
    const token = getTokenFromHeader(req);
    //verify token
    const decodedUser = verifyToken(token);
    //save the user into req object
    req.userAuth = decodedUser.id;
    if (!decodedUser) {
        return res.json({
            message: "Invalid/Expired token, please try again"
        })
    } else {
        next();
    }
}
module.exports = isLogin;