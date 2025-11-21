const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    // 1. Get token from Authorization header
    const authHeader = req.headers['authorization'];
    // Format: "Bearer <TOKEN>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // 401 Unauthorized: No token provided
        return res.status(401).json({ 
            code: "UNAUTHORIZED", 
            message: "Access Denied: No token provided." 
        });
    }

    try {
        // 2. Verify the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Attach the decoded user ID to the request object (req.user.id)
        req.user = { id: decoded.id }; 

        // 4. Move to the next function (the controller logic)
        next();
    } catch (err) {
        // 403 Forbidden: Invalid or expired token
        return res.status(403).json({ 
            code: "TOKEN_EXPIRED", 
            message: "Invalid or expired token." 
        });
    }
};

module.exports = { verifyToken };