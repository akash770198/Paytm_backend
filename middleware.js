const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(403).json({});
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token, JWT_SECRET);

        if(decoded.userId){
            req.userId = decoded.userId; //setting req.userid to decoded.userid
            next();
        } else {
            return res.status(403).json({
                msg : "error from 1"
            });
        }
    } catch (err) {
        return res.status(403).json({
            msg : "error from 2"
        });
    }
};

module.exports = {
    authMiddleware
}