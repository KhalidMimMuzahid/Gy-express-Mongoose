const Level = require("../models/levelModel");

const updateLevel = async (levelUser, user, levelNumber) => {
  const newLevelData = {
    user: user._id,
    level: levelNumber,
    user_id: user.user_id,
    name: user.name,
    mobile: user.mobile,
    email: user.email,
    sponsor_id: user.sponsor_id,
    joining_date: user.join_date,
  };

  await Level.findOneAndUpdate(
    { user_id: levelUser?.user_id },
    { $push: { level: newLevelData } },
    { new: true }
  );
};

module.exports = updateLevel;
