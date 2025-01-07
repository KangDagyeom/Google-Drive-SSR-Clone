const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization'];

    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Gán thông tin người dùng vào req.user
        next();
    } catch (error) {
        res.status(400).send('Invalid token.');
    }
};

module.exports = authMiddleware;