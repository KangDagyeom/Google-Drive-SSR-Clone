const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // Get token from cookies or headers
    const token = req.cookies.token || req.headers["authorization"];

    // If no token is found, return response without access
    if (!token) {
        return res.status(401).send("Access denied. No token provided.");
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Assign user data to req.user
        // Call next middleware
        next();
    } catch (error) {
        res.status(400).send("Invalid token.");
    }
};

module.exports = authMiddleware;
