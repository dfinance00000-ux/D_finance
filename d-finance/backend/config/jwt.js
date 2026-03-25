const jwt = require('jsonwebtoken');

// 1. Token Generate karne ka function (Login ke time use hoga)
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d', // 7 din tak login rahega user
  });
};

// 2. Token Verify karne ka function (Optional: Middleware mein bhi kar sakte hain)
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };