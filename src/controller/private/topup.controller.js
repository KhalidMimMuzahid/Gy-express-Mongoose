const { PackageBuyInfo } = require("../../models/topup.model");

const getTopupHistory = async (req, res) => {
  try {
    const allpackages = await PackageBuyInfo.find({});
    const packagesByUserId = {};

    for (const pak of allpackages) {
      const userId = pak.userId;
      if (!packagesByUserId[userId]) {
        packagesByUserId[userId] = [];
      }
      packagesByUserId[userId].push(pak);
    }
    const plainArrayOfObjects = [];
    for (const userId in packagesByUserId) {
      if (packagesByUserId.hasOwnProperty(userId)) {
        plainArrayOfObjects.push(...packagesByUserId[userId]);
      }
    }

    const histories = [];
    plainArrayOfObjects.map((pkg, index) => {
      const { userId, userFullName } = pkg;
      const package = {
        amount: pkg.packageInfo.amount,
        date: pkg.packageInfo.date,
      };
      let upgradePackage = null;
      let amount = 0;
      if (index > 0) {
        const previousPackage = plainArrayOfObjects[index - 1];

        if (pkg.packageType === "Upgrade") {
          upgradePackage = {
            amount: pkg.packageInfo.amount,
            date: pkg.packageInfo.date,
          };
          amount = upgradePackage.amount - previousPackage.packageInfo.amount;
        } else {
          amount = 0;
        }
      }
      histories.push({
        userId,
        userFullName,
        package,
        upgradepackage: upgradePackage,
        amount,
        createdAt: pkg?.createdAt,
      });
    });

    histories?.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
    if (histories?.length > 0) {
      return res.status(200).json({ data: histories });
    } else {
      return res.status(400).json({ message: "There is no topup history" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { getTopupHistory };
