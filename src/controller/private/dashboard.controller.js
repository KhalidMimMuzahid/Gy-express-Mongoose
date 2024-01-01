const User = require("../../models/auth.model");
const Wallet = require("../../models/wallet.model");

const getAdminDashboardStatsController = async (req, res) => {
  try {
    // Total Team and Direct Team count
    const alluser = (await User.find({}));
    const activeUsers = (await User.find({isActive: true }));
    const inactiveUsers = (await User.find({ isActive: false }));
    const blockedUsers = (await User.find({ userStatus: false }));
    const [investmentAmount] = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalInvestmentAmount: {
            $sum: "$selfInvestment",
          },
        },
      },
    ]);

    const data = {
      alluser: alluser.length || 0,
      activeUsers: activeUsers.length || 0,
      inactiveUsers: inactiveUsers.length || 0,
      blockedUsers: blockedUsers.length || 0,
      totalInvestmentAmount: investmentAmount.totalInvestmentAmount,
    };
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

module.exports = {
  getAdminDashboardStatsController,
};
