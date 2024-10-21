const jwt = require('jsonwebtoken');
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token; // Extract token from the cookie
    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token.' });
        }
        req.user = user; // Attach user info from the token to req.user
        next(); // Move to the next middleware or route handler
    });
};
module.exports = { authenticateToken };
