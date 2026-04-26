const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // 1. Frontend se token receive karo (Bearer token)
        const authHeader = req.header("Authorization");
        const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN_STRING" se token nikalna

        if (!token) {
            return res.status(401).json({ message: "No authentication token found. Access denied." });
        }

        // 2. Token ko verify karo apni secret key se
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Verified user ka data request mein daal do taaki routes use kar sakein
        req.user = verified;
        next();

    } catch (err) {
        res.status(401).json({ message: "Token verification failed. Please login again." });
    }
};

module.exports = auth;