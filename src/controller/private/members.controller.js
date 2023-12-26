const Kyc = require("../../models/KYCSchema");
const User = require("../../models/auth.model");
const Level = require("../../models/level.model");
const { PackageBuyInfo } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");
const Withdraw = require("../../models/withdraw.model");

const allMembersController = async (_req, res) => {
  try {
    // Retrieve all users from the User collection, excluding the password field
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select("-password");

    // Respond with the list of users
    if (users.length > 0) {
      return res.status(200).json({ data: users });
    } else {
      return res.status(400).json({ message: "There is no user" });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const activeUsersController = async (_req, res) => {
  try {
    // Retrieve active users (users with isActive set to true)
    const activeUsers = await User.find({ isActive: true })
      .sort({
        createdAt: -1,
      })
      .select("-password");

    // Respond with the list of active users
    if (activeUsers.length > 0) {
      return res.status(200).json({ data: activeUsers });
    } else {
      return res.status(400).json({ message: "There is no Active user" });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const blockedUsersController = async (_req, res) => {
  try {
    // Retrieve not active users (users with isActive set to false)
    const blockedUsers = await User.find({
      userStatus: false,
    })
      .sort({ createdAt: -1 })
      .select("-password");

    // Respond with the list of blocked users
    if (blockedUsers.length > 0) {
      return res.status(200).json(blockedUsers);
    } else {
      return res.status(400).json({ message: "There is no block user" });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const editUser = async (req, res) => {
  try {
    // Use findOneAndUpdate to find and update the user
    const updatedUser = await User.findOneAndUpdate(
      { userId: req.body.userId },
      { $set: req.body },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Can not Update User" });
    }

    return res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// change user Status
const changeUserStatus = async (req, res) => {
  try {
    const { user_id } = req.body;
    const user = await User.findOne({ userId: user_id });
    const updateUserStatus = await User.findOneAndUpdate(
      { userId: user_id },
      {
        $set: {
          userStatus: !user.userStatus,
        },
      }
    );
    if (updateUserStatus) {
      res.status(200).json({
        message: "Successfully changed user Status",
      });
    } else {
      res.status(400).json({
        message: "Cannot change user status",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Member delete
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findOneAndUpdate(
      { userId: userId },
      {
        $set: {
          deleteStatus: true,
        },
      }
    );
    if (user) {
      res.status(200).json({
        message: "Deleted successfully",
      });
    } else {
      res.status(400).json({
        message: "Cannot delete user",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.toString(),
    });
  }
};

// Team Statistics
const getTeamStatistics = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userInfo = await User.findOne({ userId });

    if (!userInfo) {
      return res.status(400).json({ message: "User is not found" });
    }

    const teamMembers = userInfo.team || [];

    const totalActiveTeam = await User.countDocuments({
      userId: { $in: teamMembers.map((member) => member.userId) },
      isActive: true,
    });

    const levelInfo = [];
    const findLevel = await Level.findOne({ userId: userId });
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
              _id: "$userId",
              totalAmount: { $last: "$packageInfo.amount" }, // Get the amount from the last document in each user group
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$totalAmount" },
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

    const walletInfo = await Wallet.findOne({ userId });

    const withdrawalInfo = await Withdraw.aggregate([
      {
        $match: { userId: userId },
      },
      {
        $group: {
          _id: null,
          totalWithdraw: { $sum: "$requestAmount" },
        },
      },
    ]);

    const info = {
      fullName: userInfo.fullName,
      package: userInfo.packageInfo?.amount,
      totalTeam: teamMembers.length,
      totalActiveTeam,
      teamStats: levelInfo,
      totalWithdraw: withdrawalInfo[0]?.totalWithdraw || 0,
      ...walletInfo,
    };

    if (info) {
      return res.status(200).json({ data: info });
    } else {
      return res.status(400).json({ message: "There is no data" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Get level details
const getTeamStatsDetails = async (req, res) => {
  try {
    const level = String(req.query.level);
    const userId = String(req.query.userId);

    if (!level) {
      return res.status(400).json({ message: "Level is missing" });
    }
    if (level > 7) {
      return res.status(400).json({ message: "Level no more than 7" });
    }
    if (!userId) {
      return res.status(400).json({ message: "User id is missing" });
    }
    const teams = await Level.findOne({ userId: userId });
    if (!teams) {
      return res.status(400).json({ message: "User id is not exist" });
    }

    const members = teams?.level?.filter((d) => d.level === level) || [];

    let histories = [];
    for (const member of members) {
      const history = await PackageBuyInfo.find({ userId: member?.userId });
      histories.push(...history);
      // const packages = await PackageBuyInfo.find({ userId: member?.userId });
      // const formattedData = await Promise.all(
      //   packages.map(async (pkg, index) => {
      //     const { userId, userFullName } = pkg;
      //     const package = {
      //       amount: pkg.packageInfo.amount,
      //       date: pkg.packageInfo.date,
      //     };

      //     let upgradePackage = null;
      //     let amount = 0;

      //     // Calculate amount only if there is a previous package
      //     if (index > 0) {
      //       const previousPackage = packages[index - 1];

      //       if (pkg.packageType === "Upgrade") {
      //         upgradePackage = {
      //           amount: pkg.packageInfo.amount,
      //           date: pkg.packageInfo.date,
      //         };
      //         amount =
      //           upgradePackage.amount - previousPackage.packageInfo.amount;
      //       } else {
      //         amount = 0;
      //       }
      //     }

      //     return {
      //       userId,
      //       userFullName,
      //       package,
      //       upgradepackage: upgradePackage,
      //       amount,
      //     };
      //   })
      // );
      // histories.push(...formattedData);
    }
    if (histories?.length > 0) {
      return res.status(200).json({ data: histories.reverse() });
    } else {
      return res.status(400).json({ message: "There is no history" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};

// update single KYC
const updateKyc = async (req, res) => {
  try {
    const result = await Kyc.findOneAndUpdate(
      { userId: req.body.userId, status: "pending" },
      { $set: { status: req.body.status } },
      { new: true } // Return the updated document
    );

    if (result) {
      return res.status(200).json({ message: "KYC updated", data: result });
    } else {
      return res
        .status(403)
        .json({ message: "KYC update not possible", data: null });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", data: null });
  }
};

// get single KYC
const getSingleKyc = async (req, res) => {
  try {
    const Kyc = await Kyc.findOne({ userId: req.query.userId });
    if (Kyc) {
      return r.rest(res, true, `KYC Found`, Kyc);
    } else {
      return r.rest(res, false, `KYC not found`, null);
    }
  } catch (e) {
    return r.rest(res, false, `something went wrong`, null);
  }
};

// get all KYC
const getAllKyc = async (req, res) => {
  try {
    const allKyc = await Kyc.find({}).sort({ _id: -1 }); // Sort by _id in reverse order

    if (allKyc.length > 0) {
      return res.status(200).json({ message: "KYC found", data: allKyc });
    } else {
      return res.status(404).json({ message: "No KYC documents found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getAllSuccessKyc = async (req, res) => {
  try {
    const allKyc = await Kyc.find({ status: "success" }).sort({ _id: -1 });

    if (allKyc.length > 0) {
      return res.status(200).json({ message: "KYC found", data: allKyc });
    }

    return res.status(404).json({ message: "No KYC documents found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getAllRejectKyc = async (req, res) => {
  try {
    const allKyc = await Kyc.find({ status: "rejected" }).sort({ _id: -1 });

    if (allKyc.length > 0) {
      return res.status(200).json({ message: "KYC found", data: allKyc });
    } else {
      return res.status(404).json({ message: "No KYC documents found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
module.exports = {
  activeUsersController,
  blockedUsersController,
  editUser,
  allMembersController,
  changeUserStatus,
  deleteUser,
  getTeamStatistics,
  getTeamStatsDetails,
  getAllKyc,
  getSingleKyc,
  updateKyc,
  getAllSuccessKyc,
  getAllRejectKyc,
};
