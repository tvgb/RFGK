const jwt = require('jsonwebtoken');

//Used to authenticate requests using the token.
module.exports = (req, res, next) => {
    try {
        const decoded = jwt.verify(req.body.token, process.env.JWT_KEY);
        req.userData = decoded;

        next();

    } catch (e) {
        return res.status(401).json({
            message: "Auth failed"
        })
    }
    
};