const sendEmailNotification = require("../../config/mailNotification");
const User = require("../../models/auth.model");
const { PackageRoi } = require("../../models/topup.model");
const Wallet = require("../../models/wallet.model");
const Withdraw = require("../../models/withdraw.model");

// Show all withdraws
const showAllWithdraw = async (_req, res) => {
  try {
    // Retrieve all withdraws from the database
    const withdraws = await Withdraw.find({}).sort({ createdAt: -1 });

    // Check if there are withdraws
    if (withdraws.length === 0) {
      return res.status(404).json({
        message: "No withdraws found",
      });
    }

    // Return the list of withdraws
    return res.status(200).json({
      message: "List of withdraws",
      data: withdraws,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Controller to get successful withdraw requests
const getSuccessfulWithdraws = async (_req, res) => {
  try {
    const successfulWithdraws = await Withdraw.find({ status: "success" }).sort(
      { createdAt: -1 }
    );
    if (successfulWithdraws.length > 0) {
      return res.status(200).json({ data: successfulWithdraws });
    } else {
      return res
        .status(400)
        .json({ message: "There is no successful withdraw history" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Controller to get rejected withdraw requests
const getRejectedWithdraws = async (_req, res) => {
  try {
    const rejectedWithdraws = await Withdraw.find({ status: "reject" }).sort({
      createdAt: -1,
    });
    if (rejectedWithdraws.length > 0) {
      return res.status(200).json({ data: rejectedWithdraws });
    } else {
      return res
        .status(400)
        .json({ message: "There is no rejected withdraws" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};
// Controller to update the status of a withdraw request
const updateWithdrawStatus = async (req, res) => {
  try {
    const { transaction_id, status, userId } = req.body;
    // const currentUser = await User.findOne({ userId: userId });
    let message = "";
    const existingWithdraw = await Withdraw.findOne({
      status: "pending",
      transactionId: transaction_id,
    });

    if (existingWithdraw) {
      if (status === "success") {
        await Withdraw.findOneAndUpdate(
          {
            userId: userId,
            status: "pending",
            transactionId: transaction_id,
          },
          {
            $set: {
              status: status,
            },
          }
        );
        // Send mail notifiction to user email with request status
        // sendEmailNotification(
        //   currentUser?.userId,
        //   currentUser?.fullName,
        //   currentUser?.email,
        //   "Withdrawal Request Status Update",
        //   existingWithdraw?.requestAmount,
        //   "Your withdrawal request has been successfully processed, and the funds have been transferred to your designated account.",
        //   "withdrawal"
        // );
        message = "Withdraw Successfully";
        return res.status(200).json({ message });
      } else {
        await Withdraw.findOneAndUpdate(
          {
            userId: userId,
            status: "pending",
            transactionId: transaction_id,
          },
          {
            $set: {
              status: status,
            },
          }
        );
        if (existingWithdraw?.withdrawType === "investment") {
          // const extPackage = await PackageRoi.findOne({ userId: userId });
          await Wallet.findOneAndUpdate(
            { userId: userId },
            { $inc: { selfInvestment: +existingWithdraw?.requestAmount } },
            { new: true }
          );
          const upPckg = await PackageRoi.findOneAndUpdate(
            { userId: userId },
            {
              $set: { isActive: true },
              $inc: { currentPackage: +existingWithdraw?.requestAmount },
            },
            { new: true }
          );
          await User.findOneAndUpdate(
            { userId: userId },
            {
              $set: {
                isActive: true,
                packageInfo: {
                  amount: upPckg?.currentPackage,
                },
              },
            }
          );
          await PackageRoi.findOneAndUpdate(
            { userId: userId },
            { $set: { isActive: true } }
          );
        } else if (existingWithdraw?.withdrawType === "income") {
          await Wallet.findOneAndUpdate(
            { userId: userId },
            { $inc: { withdrawalBallance: +existingWithdraw?.requestAmount } },
            { new: true }
          );
        }
        // Send mail notifiction to user email with request status
        // sendEmailNotification(
        //   currentUser?.userId,
        //   currentUser?.fullName,
        //   currentUser?.email,
        //   "Withdrawal Request Status Update",
        //   existingWithdraw?.requestAmount,
        //   `Unfortunately, your withdrawal request for $${existingWithdraw?.requestAmount} amount has been rejected.`,
        //   "withdrawal"
        // );
        message = "Withdraw Rejected";
      }
      return res.status(400).json({
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

module.exports = {
  showAllWithdraw,
  updateWithdrawStatus,
  getSuccessfulWithdraws,
  getRejectedWithdraws,
};
