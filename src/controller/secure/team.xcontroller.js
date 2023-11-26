const User = require("../../models/auth.model");
const Level = require("../../models/level.model");
const { PackageBuyInfo } = require("../../models/topup.model");

// get level team
const getLevelTeam = async (req, res) => {
  try {
    const user_id = req.auth;

    if (!user_id) {
      return res.status(400).json({
        message: "Cannot find User ID",
      });
    }

    const levelTeam = await Level.findOne({ userId: user_id?.toUpperCase() });

    if (!levelTeam) {
      return res.status(400).json({
        message: "Cannot find any team",
      });
    }

    const levelHistory = [];

    for (const levelUser of levelTeam.level) {
      const activeLevel = await User.findOne({
        userId: levelUser.userId,
      }).select([
        "userId",
        "fullName",
        "sponsorId",
        "sponsorName",
        "joiningDate",
        "activationDate",
      ]);

      levelHistory.push({
        _id: activeLevel._id,
        userId: activeLevel.userId,
        fullName: activeLevel.fullName,
        sponsorId: activeLevel.sponsorId,
        sponsorName: activeLevel.sponsorName,
        joiningDate: activeLevel.joiningDate,
        activationDate: activeLevel.activationDate,
        level: levelUser.level,
      });
    }

    return res.status(200).json({
      name: levelTeam.fullName,
      userId: levelTeam.userId,
      email: levelTeam.email,
      sponsorId: levelTeam.sponsorId,
      level: levelHistory.reverse(),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
// Get Direct Level Team
const getDirectLevelTeam = async (req, res) => {
  try {
    const user_id = req.auth;

    if (!user_id) {
      return res.status(400).json({
        message: "Cannot find User ID",
      });
    }

    const levelTeam = await Level.findOne({ userId: user_id?.toUpperCase() });

    if (!levelTeam) {
      return res.status(400).json({
        message: "Cannot find any team",
      });
    }

    const levelHistory = [];

    for (const levelUser of levelTeam.level) {
      if (levelUser.level === "1") {
        const activeLevel = await User.findOne({
          userId: levelUser.userId,
        }).select([
          "userId",
          "fullName",
          "sponsorId",
          "sponsorName",
          "joiningDate",
          "activationDate",
        ]);

        levelHistory.push({
          _id: activeLevel._id,
          userId: activeLevel.userId,
          fullName: activeLevel.fullName,
          sponsorId: activeLevel.sponsorId,
          sponsorName: activeLevel.sponsorName,
          joiningDate: activeLevel.joiningDate,
          activationDate: activeLevel.activationDate,
          level: levelUser.level,
        });
      }
    }

    return res.status(200).json({
      name: levelTeam.fullName,
      userId: levelTeam.userId,
      email: levelTeam.email,
      sponsorId: levelTeam.sponsorId,
      level: levelHistory.reverse(),
    });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
// Get level business
const getLevelBusiness = async (req, res) => {
  try {
    const levelInfo = [];
    const findLevel = await Level.findOne({ userId: req.auth });
    for (let i = 1; i <= 7; i++) {
      const levels = findLevel?.level?.filter((d) => d.level === `${i}`) || [];
      const totalTeam = +levels?.length; // total Team

      // Get total business of level [i]
      let totalBusinessAmount = 0;
      for (const singleLevel of levels) {
        const [packageAmount] = await PackageBuyInfo.aggregate([
          {
            $match: {
              userId: singleLevel?.userId,
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$packageInfo.amount" },
            },
          },
        ]);
        if (packageAmount && packageAmount.totalAmount !== undefined) {
          totalBusinessAmount += packageAmount.totalAmount;
        }
      }
      const data = {
        level: i,
        totalTeam: totalTeam,
        totalBusinessAmount: totalBusinessAmount,
      };
      levelInfo.push(data);
    }
    if (levelInfo?.length > 0) {
      return res.status(200).json({ data: levelInfo });
    } else {
      return res.status(400).json({ message: "There is no history" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { getLevelTeam, getDirectLevelTeam, getLevelBusiness };
