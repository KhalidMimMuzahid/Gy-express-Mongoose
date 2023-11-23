const User = require("../models/userModel");

const getLoggedInUser = async (emailOrId) => {
  const user = await User.findOne({
    $or: [{ user_id: emailOrId }, { email: emailOrId }],
  });

  return user;
};

module.exports = getLoggedInUser;
