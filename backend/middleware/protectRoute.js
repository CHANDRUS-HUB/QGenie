// middleware/protectRoute.js
const jwt = require("jsonwebtoken");

const protectRoute = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized - No acess provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user payload to request
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized - Invalid acess" });
    }
};

module.exports = protectRoute;
