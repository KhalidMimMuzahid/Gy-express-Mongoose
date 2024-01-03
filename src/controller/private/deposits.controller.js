// const sendEmailNotification = require("../../config/mailNotification");
const User = require("../../models/auth.model");
const Deposite = require("../../models/deposit.model");
const GameWalletPercentage = require("../../models/gameWalletPercentage");
const Level = require("../../models/level.model");
const Wallet = require("../../models/wallet.model");

// Show all deposits
const showAllDeposits = async (_req, res) => {
  try {
    const allDeposits = await Deposite.find({}).select("history").lean();
    const deposits = allDeposits.flatMap((deposit) => deposit.history);
    const reversedDeposits = deposits.reverse();

    // Sort deposits by date in reverse order (latest first)
    //     deposits.sort((a, b) => (b.time.time) - (a.time.time));
    // console.log(deposits)
    if (deposits.length === 0) {
      return res.status(404).json({ message: "No deposits found" });
    }

    return res
      .status(200)
      .json({ message: "List of deposits", data: deposits });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Show successful deposits
const showSuccessDeposits = async (_req, res) => {
  try {
    // Retrieve successful deposits from the database
    const successDeposits = await Deposite.aggregate([
      {
        $addFields: {
          history: {
            $filter: {
              input: "$history",
              as: "item",
              cond: { $eq: ["$$item.status", "success"] },
            },
          },
        },
      },
      {
        $match: {
          "history.status": "success",
        },
      },
    ]);
    const deposits = [];
    for (const deposit of successDeposits) {
      const history = deposit?.history;
      deposits.push(...history);
    }
    deposits?.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
    // Check if there are successful deposits
    if (deposits.length === 0) {
      return res.status(404).json({
        message: "No successful deposits found",
      });
    }
    // Return the list of successful deposits
    return res.status(200).json({
      message: "List of successful deposits",
      data: deposits,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something Went wrong",
    });
  }
};
// Show rejected deposits
const showRejectedDeposits = async (_req, res) => {
  try {
    // Retrieve successful deposits from the database
    const rejectedDeposits = await Deposite.aggregate([
      {
        $addFields: {
          history: {
            $filter: {
              input: "$history",
              as: "item",
              cond: { $eq: ["$$item.status", "reject"] },
            },
          },
        },
      },
      {
        $match: {
          "history.status": "reject",
        },
      },
    ]);
    const deposits = [];
    for (const deposit of rejectedDeposits) {
      const history = deposit?.history;
      deposits.push(...history);
    }
    deposits?.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

    // Check if there are rejected deposits
    if (deposits.length === 0) {
      return res.status(400).json({
        message: "No rejected deposits found",
      });
    }

    // Return the list of successful deposits
    return res.status(200).json({
      message: "List of rejected deposits",
      data: deposits,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Update the status of a deposit based on its _id
const updateDepositStatus = async (req, res) => {
  try {
    const { transaction_id, status } = req.body;
    let message = "";
    const existingDeposite = await Deposite.aggregate([
      {
        $match: {
          "history.status": {
            $eq: "pending",
          },
          "history.transactionId": {
            $eq: transaction_id,
          },
        },
      },
      {
        $project: {
          history: {
            $filter: {
              input: "$history",
              as: "item",
              cond: {
                $eq: ["$$item.transactionId", transaction_id],
              },
            },
          },
        },
      },
    ]);

    const existingDeposit = existingDeposite[0]?.history[0];
    // user
    const currentUser = await User.findOne({ userId: existingDeposit.userId });

    if (existingDeposit) {
      await Deposite.findOneAndUpdate(
        { history: { $elemMatch: { transactionId: transaction_id } } },
        {
          $set: {
            "history.$[t].status": status,
          },
        },
        {
          arrayFilters: [{ "t.transactionId": transaction_id }],
        }
      );

      if (status === "success") {
        await Wallet.findOneAndUpdate(
          { userId: existingDeposit.userId },
          {
            $inc: {
              depositBalance: +existingDeposit.amount,
            },
          }
        );

        const allLevel_1_Users = await Level.find(
          { "level.userId": currentUser?.userId, "level.level": "1" },
          { userId: 1 }
        );

        if (allLevel_1_Users.length > 0) {
          for (const levelUser of allLevel_1_Users) {
            let percentage;
            const gameWalletPercentage = await GameWalletPercentage.findOne({});

            try {
              percentage = gameWalletPercentage?.level1 || 1;
            } catch (error) {
              // console.log({ error });
              percentage = 1;
            }

            const gameWalletPayout =
              (existingDeposit.amount * percentage) / 100;
            const gameWalletSharedUser = await Wallet.findOneAndUpdate(
              { userId: levelUser?.userId },
              {
                $inc: {
                  // totalIncome: +winningSharePayout,
                  gameWallet: +gameWalletPayout,
                },
              },
              { new: true }
            );
            if (gameWalletSharedUser) {
              // await LevelIncome.create({
              //   userId: levelUser?.userId,
              //   incomeFrom: bet?.userId,
              //   level: levelObject?.level,
              //   type: "winning-share",
              //   percentageOfTotalAmount: payout,
              //   percentage: percentage,
              //   amount: winningSharePayout,
              //   date,
              //   time,
              //   transactionID: generateString(15),
              // });
            }
          }
        }
        // // Send mail notifiction to user email with request status
        // sendEmailNotification(
        //   currentUser?.userId,
        //   currentUser?.fullName,
        //   currentUser?.email,
        //   "Deposit Request Status Update",
        //   existingDeposit.amount,
        //   "Your deposit request has been successfully processed, and the funds have been added to your wallet",
        //   "deposit"
        // );
        message = "Deposit succeeded";
      } else {
        // Send mail notifiction to user email with request status
        sendEmailNotification(
          currentUser?.userId,
          currentUser?.fullName,
          currentUser?.email,
          "Deposit Request Status Update",
          existingDeposit?.amount,
          `Unfortunately, Your deposit request for $${existingDeposit?.amount} amount has been rejected.`,
          "deposit"
        );
        message = "Deposit Rejected";
      }
      return res.status(200).json({
        message,
      });
    } else {
      return res.status(400).json({
        message: "Status Cannot be changed",
      });
    }
  } catch (e) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

// Export the showAllDeposits function for use in your routes
module.exports = {
  showAllDeposits,
  showSuccessDeposits,
  showRejectedDeposits,
  updateDepositStatus,
};
