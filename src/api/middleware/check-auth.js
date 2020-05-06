const jwt = require('jsonwebtoken');

//Used to authenticate requests using the token.
module.exports = (req, res, next) => {
    try {
		const authHeader = req.headers.authorization;
		const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;

        next();

    } catch (e) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
    
};