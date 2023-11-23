const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const generateToken = async (userId) => {
  const user = await User.findOne({$or: [{ user_id: userId }, { email: userId }]})
  const id = user?.user_id
  return jwt.sign({ id }, process.env.SEC_KEY, {
    expiresIn: "7d",
    algorithm: "HS512",
  });
};

const verify_jwt = (token) => {
  try {
    // tokenTrim = token.split(" ")[1];
    let decoded = jwt.verify(token, process.env.SEC_KEY);
    return { status: true, data: decoded };
  } catch (e) {
    return { status: false, message: e.message };
  }
};

module.exports = { generateToken, verify_jwt };
