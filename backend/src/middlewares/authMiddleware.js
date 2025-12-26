const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async function (req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    if (token.split('.').length !== 3) {
        return res.status(401).json({ error: 'Malformed token' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        req.user = user;
        next();
    } catch (err) {
        console.error('❌ Token error:', err);
        res.status(401).json({ error: 'Invalid token' });
    }
};


