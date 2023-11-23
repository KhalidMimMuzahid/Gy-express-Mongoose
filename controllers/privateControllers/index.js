const bcrypt = require("bcryptjs");
const User = require("../../models/userModel");
const Otp = require("../../models/otpModel");
const Wallet = require("../../models/walletModel");
const cloudinary = require("../../config/cloudinary");
const Cloudinary = require("cloudinary");
const DepositRequestHistory = require("../../models/DepositHistory");
const DepositHistory = require("../../models/DepositHistory");
const SystemWallet = require("../../models/SystemInfo");
const SwapHistory = require("../../models/SwapHistory");
const WithdrawHistory = require("../../models/WithdrawHistory");
const LevelIncome = require("../../models/levelIncome");
const ValidationErrorMsg = require("../../helpers/ValidationErrorMsg");
const { validationResult } = require("express-validator");
const { StakingPlan, StakingReward } = require("../../models/StakingModel");
const { PromotionScheme } = require("../../models/promotionalScheme");
const Contact = require("../../models/contactus.model");
const SupportTicket = require("../../models/supportTicket.model");
const Update = require("../../models/updates.model");
const getIstTime = require("../../config/getTime");
const { PDFData } = require("../../models/settingModel");
const { FundTransfer } = require("../../models/fundTransferModel");
const tokenPrice = require("../../models/tokenPrice");
const PopupImage = require("../../models/popupImageModel");
const getDashboardData = async (_req, res) => {
  try {
    const totalUsers = await User.find({}).count();
    const [totalHashProTokenOfUsers] = await Wallet.aggregate([
      {
        $group: { _id: null, totalToken: { $sum: "$totalHashProToken" }, busdBalance: { $sum: "$busdBalance" }, usdtBalance: { $sum: "$usdtBalance" }, allToken: { $sum: "$allToken" } },
      },
    ]);

    const [totalDirectReward] = await LevelIncome.aggregate([
      { $group: { _id: null, totalUsdt: { $sum: "$amountOfDollar" }, totalToken: { $sum: "$amountOfToken" } } },
    ]);

    const data = {
      totalHashProTokenOfUsers: totalHashProTokenOfUsers?.totalToken,
      totalUsers: totalUsers,
      totalDirectUsdt: totalHashProTokenOfUsers?.busdBalance + totalHashProTokenOfUsers?.usdtBalance,
      totalDirectToken: totalHashProTokenOfUsers?.allToken
    };

    return res.status(200).json({
      data: data,
      message: "Dashboard data",
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const swapHistoryByAdmin = async (_req, res) => {
  try {
    const histories = await SwapHistory.find({}).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      data: histories,
      message: "Swap history",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const updateSystemWalletAPI = async (req, res) => {
  const { INR_for_per_dollar, per_hash_token_price_in_USDT } = req.body;

  const parsedINRForPerUSDT = Number(INR_for_per_dollar);
  const parsedHashProTokenPrice = Number(per_hash_token_price_in_USDT);

  try {
    if (parsedINRForPerUSDT < 0 || isNaN(parsedINRForPerUSDT)) {
      return res.status(400).json({
        message: "Invalid INR_for_per_dollar!",
      });
    } else if (parsedHashProTokenPrice < 0 || isNaN(parsedHashProTokenPrice)) {
      return res.status(400).json({
        message: "Invalid Invalid per_hash_token_price_in_USDT!!",
      });
    } else {
      const systemWallet = await SystemWallet.findOne({
        infoId: "system-info",
      });
      const updatedSystemWallet = await SystemWallet.findOneAndUpdate(
        { infoId: "system-info" },
        {
          $set: {
            INR_for_per_dollar: parsedINRForPerUSDT
              ? parsedINRForPerUSDT
              : systemWallet.INR_for_per_dollar,
            per_hash_token_price_in_USDT: parsedHashProTokenPrice
              ? parsedHashProTokenPrice
              : systemWallet.per_hash_token_price_in_USDT,
          },
        },
        { new: true, upsert: true }
      );
      if (updatedSystemWallet) {
        return res.status(200).json({
          message: "System wallet updated",
        });
      }
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const approveDepositRequestByAdmin = async (req, res) => {
  try {
    const depositData = req.body;

    if (!depositData.trxId) {
      return res.status(400).json({
        message: "Invalid transaction id",
      });
    }

    if (!depositData.status) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const depositHistory = await DepositRequestHistory.findOne({
      trxId: depositData.trxId,
    });

    if (!depositHistory) {
      return res.status(400).json({
        message: "No deposit history found",
      });
    }

    if (
      depositHistory.status === "success" &&
      depositData.status === "success"
    ) {
      return res.status(400).json({
        message: "You can't change the status after approved",
      });
    }

    if (
      depositHistory.status === "success" &&
      depositData.status === "rejected"
    ) {
      return res.status(400).json({
        message: "You can't change the status after approved",
      });
    }

    if (
      depositHistory.status === "success" &&
      depositData.status === "pending"
    ) {
      return res.status(400).json({
        message: "You can't change the status after approved",
      });
    }

    if (
      depositHistory.status === "rejected" &&
      depositData.status === "rejected"
    ) {
      return res.status(400).json({
        message: "You can't change the status after approved",
      });
    }

    if (
      depositHistory.status === "rejected" &&
      depositData.status === "success"
    ) {
      return res.status(400).json({
        message: "You can't change the status after approved",
      });
    }

    if (
      depositHistory.status === "rejected" &&
      depositData.status === "pending"
    ) {
      return res.status(400).json({
        message: "You can't change the status after approved",
      });
    }

    if (
      depositHistory.status === "pending" &&
      depositData.status === "pending"
    ) {
      return res.status(400).json({
        message: "Already pending",
      });
    }

    if (
      depositHistory.status === "pending" &&
      depositData.status === "rejected"
    ) {
      await DepositRequestHistory.findOneAndUpdate(
        {
          trxId: depositData.trxId,
        },
        { $set: { status: depositData.status } }
      );
      return res.status(200).json({
        message: "Rejected Successfully",
      });
    }

    if (
      depositHistory.status === "pending" &&
      depositData.status === "success"
    ) {
      await DepositRequestHistory.findOneAndUpdate(
        {
          trxId: depositData.trxId,
        },
        { $set: { status: depositData.status } }
      );

      await Wallet.findOneAndUpdate(
        { user_id: depositHistory.user_id },
        {
          $inc: {
            total_deposited_hpt: depositHistory?.payment_method.toLowerCase() === "hpt" ? +depositHistory.deposit_amount_hpt : 0,
            total_deposited_dollar: depositHistory?.payment_method.toLowerCase() === "hpt" ? 0 : +depositHistory.deposit_amount_dollar,
            busdBalance: depositHistory?.payment_method.toLowerCase() === "busd" ? +depositHistory.deposit_amount_dollar : +0,
            usdtBalance: depositHistory?.payment_method.toLowerCase() === "usdt" ? +depositHistory.deposit_amount_dollar : +0,
            totalHashProToken: depositHistory?.payment_method.toLowerCase() === "hpt" ? +depositHistory.deposit_amount_hpt : +0,

          },
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Approved Successfully",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong!",
    });
  }
};

const updatePopUpImage = async (req, res) => {
  try {
    if (!req.body.url) {
      return res.status(400).json({
        message: "Invalid url",
      });
    }
    const result = await SystemWallet.findOneAndUpdate(
      { infoId: "system-info" },
      {
        $set: {
          popUpImageUrl: req.body.url,
        },
      },
      { new: true }
    );
    return res.status(200).json({
      data: result,
      message: "data of system",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const getAllDepositByAdmin = async (req, res) => {
  try {
    const result = await DepositHistory.find(req.query).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      data: result,
      message: "Deposit history retrieved successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const changeUserStatus = async (req, res) => {
  try {
    const { user_id } = req.body;
    const user = await User.findOne({ user_id: user_id });
    const updateUserStatus = await User.findOneAndUpdate(
      { user_id: user_id },
      {
        $set: {
          user_status: !user.user_status,
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
    res.status(400).json({
      message: error.toString(),
    });
  }
};

const getAllActiveUser = async (_req, res) => {
  try {
    const user = await User.find({ isActive: true, user_id: { $ne: "admin" } })
      .sort("-_id")
      .select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({
      message: error.toString(),
    });
  }
};

const getAllUser = async (_req, res) => {
  try {
    const user = await User.find({ user_id: { $ne: "admin" } }).sort("-_id").select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({
      message: error.toString(),
    });
  }
};

const getBlockedUser = async (_req, res) => {
  try {
    const user = await User.find({ user_status: false })
      .sort("-_id")
      .select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({
      message: error.toString(),
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.body;
    const user = await User.findOneAndUpdate(
      { user_id: user_id },
      {
        $set: {
          delete_status: true,
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

const editUser = async (req, res) => {
  try {
    const { data } = req.body;
    const user = await User.findOneAndUpdate({ user_id: data.user_id }, data);
    if (user) {
      res.status(200).json({
        message: "Update user info successfully",
      });
    } else {
      res.status(400).json({
        message: "Cannot update user info",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.toString(),
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password, otpCode } = req.body;
    const user_id = req.auth.id;
    if (!new_password) {
      res.status(400).json({
        message: "New password is missing",
      });
    }
    if (!current_password) {
      res.status(400).json({
        message: "Current password is missing",
      });
    }
    if (!otpCode) {
      res.status(400).json({
        message: "OTP is missing",
      });
    }
    // find user
    const user = await User.findOne({ user_id: user_id });
    if (user && (await user.matchPassword(current_password))) {
      // check OTP
      const otp = await Otp.findOne({ email: user.email });
      if (otp && parseFloat(otp?.code) === parseFloat(otpCode)) {
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(new_password, salt);
        await User.findOneAndUpdate(
          { user_id: user?.user_id },
          {
            $set: {
              password: encryptedPassword,
            },
          },
          { new: true }
        );
        res.status(200).json({
          message: "Password change successfully",
        });
      } else {
        res.status(400).json({
          message: "Invalid OTP",
        });
      }
    } else {
      res.status(400).json({
        message: "Invalid Current Password",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.toString(),
    });
  }
};

const updateEmail = async (req, res) => {
  try {
    if (!req.body.current_email) {
      res.status(400).json({
        message: "Field is required!",
      });
    } else {
      // let userId = req.auth.id;
      let post = req.body;
      const { current_email, new_email, otpCode } = post;
      const user_id = req.auth.id;
      const user = await User.findOne({ user_id: user_id });
      // check already have anaccount with this email or not
      const existingUser = await User.findOne({ email: new_email });
      // check OTP
      const otp = await Otp.findOne({ email: new_email });
      if (parseFloat(otp?.code) === parseFloat(otpCode)) {
        if (!existingUser && user && user.email === current_email) {
          let updateEmail = await User.findOneAndUpdate(
            { user_id: user_id },
            {
              $set: {
                email: new_email,
              },
            },
            { new: true }
          );
          res.status(200).json({
            message: "Email changed Successfully",
          });
        } else {
          res.status(400).json({
            message: "Invalid user ID or email",
          });
        }
      } else {
        res.status(404).json({
          message: "Invalid OTP",
        });
      }
    }
  } catch (e) {
    //console.log(e);
    res.status(400).json({
      message: e.toString(),
    });
  }
};

// get All withdraw history
const allWithdrawHistory = async (_req, res) => {
  try {
    // const withdraw = await Withdraw.find({}).sort({
    //   updatedAt: -1,
    //   "history.date": 1,
    // });
    let withdraw = await WithdrawHistory.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "user_id",
          as: "user",
        },
      },
      {
        $project: {
          _id: 1,
          user_id: 1,
          sponsor_id: 1,
          request_amount: 1,
          withdraw_charge: 1,
          amount_after_charge: 1,
          trx_address: 1,
          status: 1,
          current_balance: 1,
          transaction_id: 1,
          date: 1,
          time: 1,
          createdAt: 1,
          updatedAt: 1,
          hashTID: 1,
          type: 1,
          __v: 1,
          user: {
            $arrayElemAt: ["$user.name", 0],
          },
        },
      },
    ]).sort({
      updatedAt: -1,
      "history.date": 1,
    });
    // console.log("mergeData", mergeData)
    res.status(200).json({ allWithdraw: withdraw });
  } catch (error) {
    res.send(error);
  }
};

// get success Withdraw history
const successWithdrawHistory = async (_req, res) => {
  try {
    // const withdraw = await Withdraw.find({ status: "success" }).sort({
    //   updatedAt: -1,
    //   "history.date": 1,
    // });
    const withdraw = await WithdrawHistory.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "user_id",
          as: "user",
        },
      },
      {
        $match: {
          status: "success",
        },
      },
      {
        $project: {
          _id: 1,
          user_id: 1,
          sponsor_id: 1,
          request_amount: 1,
          withdraw_charge: 1,
          amount_after_charge: 1,
          trx_address: 1,
          status: 1,
          current_balance: 1,
          transaction_id: 1,
          date: 1,
          time: 1,
          createdAt: 1,
          updatedAt: 1,
          hashTID: 1,
          __v: 1,
          user: {
            $arrayElemAt: ["$user.name", 0],
          },
        },
      },
    ]).sort({
      updatedAt: -1,
      "history.date": 1,
    });
    res.status(200).json({ allWithdraw: withdraw });
  } catch (error) {
    res.send(error);
  }
};

// get reject withdraw history
const rejectWithdrawHistory = async (_req, res) => {
  try {
    // const withdraw = await Withdraw.find({ status: "reject" }).sort({
    //   updatedAt: -1,
    //   "history.date": 1,
    // });
    const withdraw = await WithdrawHistory.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "user_id",
          as: "user",
        },
      },
      {
        $match: {
          status: "reject",
        },
      },
      {
        $project: {
          _id: 1,
          user_id: 1,
          sponsor_id: 1,
          request_amount: 1,
          withdraw_charge: 1,
          amount_after_charge: 1,
          trx_address: 1,
          status: 1,
          current_balance: 1,
          transaction_id: 1,
          date: 1,
          time: 1,
          createdAt: 1,
          updatedAt: 1,
          hashTID: 1,
          __v: 1,
          user: {
            $arrayElemAt: ["$user.name", 0],
          },
        },
      },
    ]).sort({
      updatedAt: -1,
      "history.date": 1,
    });
    res.status(200).json({ allWithdraw: withdraw });
  } catch (error) {
    res.send(error);
  }
};
const changeWithdrawStatus = async (req, res) => {
  try {
    const { transaction_id, status, userId, hashTID } = req.body;
    let message = "";
    const existingWithdraw = await WithdrawHistory.findOne({
      status: "pending",
      transaction_id: transaction_id,
    });

    if (existingWithdraw) {
      if (status === "success") {
        // const returnMessage = await sendToken1(
        //   transaction_id,
        //   existingWithdraw.trx_address,
        //   existingWithdraw.amount_after_charge,
        //   userId
        // );

        (await WithdrawHistory.findOneAndUpdate(
          {
            user_id: userId,
            status: "pending",
            transaction_id: transaction_id,
          },
          {
            $set: {
              status: status,
            },
          }
        ));
        return res.status(200).json({
          message: "Status change successfully"
        })
        // return returnMessage.status
        //   ? res.status(200).json({
        //       message,
        //     })
        //   : res.status(400).json({
        //       message,
        //       data: returnMessage?.data,
        //     });
      } else {
        const withdrawReject = await WithdrawHistory.findOneAndUpdate(
          {
            user_id: userId,
            status: "pending",
            transaction_id: transaction_id,
          },
          {
            $set: {
              status: status,
            },
          }
        );

        if (withdrawReject.type === "busd") {
          await Wallet.findOneAndUpdate(
            { user_id: userId },
            {
              $inc: {
                busdBalance: +parseFloat(withdrawReject.request_amount),
              },
            }
          );
        }
        if (withdrawReject.type === "usdt") {
          await Wallet.findOneAndUpdate(
            { user_id: userId },
            {
              $inc: {
                usdtBalance: +parseFloat(withdrawReject.request_amount),
              },
            }
          );
        }
        if (withdrawReject.type === "hpt") {
          await Wallet.findOneAndUpdate(
            { user_id: userId },
            {
              $inc: {
                totalHashProToken: +parseFloat(withdrawReject.request_amount),
              },
            }
          );
        }
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

    if (hashTID && transaction_id) {
      const extWithdraw = await WithdrawHistory.findOne({
        transaction_id: transaction_id,
      });
      if (extWithdraw) {
        await WithdrawHistory.findOneAndUpdate(
          {
            transaction_id: transaction_id,
          },
          {
            $set: {
              hashTID: hashTID,
            },
          }
        );

        return res.status(200).json({
          message: "Hash added successfully"
        })
      }
    }
  } catch (e) {
    console.log({ e })
    return res.status(400).json({
      message: e.message,
    });
  }
};

// fund transfer
const createFundTransfer = async (req, res) => {
  const error = validationResult(req).formatWith(ValidationErrorMsg);
  if (!error.isEmpty()) {
    let msg;
    Object.keys(req.body).map((d) => {
      if (error.mapped()[d] !== undefined) {
        msg = error.mapped()[d];
      }
    });
    if (msg !== undefined) {
      return res.status(400).json({
        message: msg,
      });
    }
  }
  try {
    const { receiverUserid, receiverName, amount } = req.body;
    // Add amount to receiver wallet
    await Wallet.findOneAndUpdate(
      { user_id: receiverUserid },
      {
        $inc: {
          totalHashProToken: +amount
        }
      }
    )
    // history create
    await FundTransfer.create({
      fundSenderUserId: "admin",
      fundSenderName: "Hash Pro Official",
      fundReceiverUserId: receiverUserid,
      fundReceiverName: receiverName,
      amount: amount,
      date: new Date(getIstTime().date).toDateString(),
      time: getIstTime().time
    })
    return res.status(201).json({ message: "Fund transfer successful" })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: "Something went wrong" });
  }
};
// Get fund transfer history
const getAllFundTransferHistory = async (_req, res) => {
  try {
    const history = await FundTransfer.find({}).sort({ createdAt: -1 })
    if (history.length > 0) {
      return res.status(200).json({ data: history })
    } else {
      return res.status(400).json({ message: "There is no fund history" })
    }
  } catch (error) {
    console.log({ error });
    return res.status(400).json({ message: "Something went wrong" })
  }
}

// get stake history
const getAllStakingHistory = async (_req, res) => {
  try {
    const history = await StakingPlan.find({}).sort({ createdAt: -1 })
    if (history?.length > 0) {
      return res.status(200).json({ data: history })
    } else {
      return res.status(400).json({ message: "There is no stake history" })
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" })
  }
}

// Get all Staking level earning history
const getAllStakingLevelEarning = async (_req, res) => {
  try {
    const history = await LevelIncome.find({ incomeType: "team-reward" }).sort({ createdAt: -1 })
    if (history.length > 0) {
      return res.status(200).json({ data: history })
    } else {
      return res.status(400).json({ message: "There is no stake level earning history" })
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" })
  }
}

// Get stake self earning history
const getAllStakeSelfEarning = async (_req, res) => {
  try {
    const stakingPlans = await StakingPlan.find({}).select("history").sort({ createdAt: -1 }).exec();

    // Extract the history field from each staking plan
    const allHistories = stakingPlans.map((plan) => plan.history).flat();

    if (allHistories.length > 0) {
      return res.status(200).json({ data: allHistories });
    } else {
      return res.status(400).json({ message: "There is no stake self earning history" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
}
// Create promotional scheme
const uploadPromotionalSchemeImage = async (req, res) => {
  const { id } = req.body;
  try {
    const promo = await PromotionScheme.find({});
    if (promo.length >= 6) {
      return res.status(400).json({ message: "Maximum image upload 6" });
    }
    for (const file of req.files) {
      const { path } = file;
      const result = await cloudinary.uploader.upload(path);
      const image = {
        url: result?.secure_url,
        publicId: result?.public_id,
      };
      const extPromo = await PromotionScheme.findOne({ _id: id });
      if (!extPromo) {
        await PromotionScheme.create({
          image: image,
        });
        return res.status(200).json({ message: "Promotional scheme Sent successfully" });
      } else {
        await Cloudinary.v2.api.delete_resources(extPromo?.image?.publicId);
        await PromotionScheme.findByIdAndUpdate({ _id: id }, { $set: { image: image } });
        return res.status(200).json({ message: "Promotional Scheme updated successfully" });
      }
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Something went wrong" });
  }
};
// Delete promotional scheme image
const deletePromotionalSchemeImage = async (req, res) => {
  const { id, publicId } = req.body;
  try {
    // Delete the image from Cloudinary
    const oldPic = await Cloudinary.v2.api.delete_resources(publicId);

    // Delete the Reward document
    const deleteImage = await PromotionScheme.findByIdAndDelete({ _id: id });

    if (oldPic && deleteImage) {
      res.status(200).json({
        message: "Successfully deleted Promotional Scheme Image",
      });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: "Something went wrong" });
  }
};
// get promotinal scheme history
const getAllPromotionalScheme = async (_req, res) => {
  try {
    const rewards = await PromotionScheme.find({}); // Retrieve all documents from the PromotionScheme collection
    return res.status(200).json(rewards); // Send the PromotionScheme as a JSON response
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: "Something went wrong" });
  }
};
// Get All contact history
const getAllContactUsHistory = async (_req, res) => {
  try {
    const allContactUs = await Contact.find({});
    const histories = [];
    for (const contact of allContactUs) {
      for (let i = contact?.history.length - 1; i >= 0; i--) {
        const history = contact?.history[i];
        histories.push(history);
      }
    }
    if (histories.length > 0) {
      return res.status(200).json({ data: histories });
    } else {
      return res.status(400).json({
        message: "No Contact us history found",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.toString(),
    });
  }
};
// Get All support history
const getAllSupportHistory = async (_req, res) => {
  try {
    const allSupportTickets = await SupportTicket.find({});
    const histories = [];
    for (const ticket of allSupportTickets) {
      for (let i = ticket?.history.length - 1; i >= 0; i--) {
        const history = ticket?.history[i];
        histories.push(history);
      }
    }
    if (histories.length > 0) {
      return res.status(200).json({ data: histories });
    } else {
      return res.status(400).json({
        message: "No support tickets found",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};
// Create update
const createUpdate = async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ message: "Title is required" })
    }
    if (!req.body.description) {
      return res.status(400).json({ message: "Description is required" })
    }
    await Update.create({
      userId: req.auth.id,
      title: req.body.title,
      description: req.body.description,
      date: new Date(getIstTime().date).toDateString(),
      time: getIstTime().time,
    })
    return res.status(201).json({ message: "Update created successful" })
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" })
  }
}

//   Change PDF
const changePdfLink = async (req, res) => {
  try {
    if (!req.body.pdfLink)
      res.status(400).json({
        message: "PDF link is missing",
      });
    const findPdf = await PDFData.findOne({ pdfId: "PDFID" });
    if (findPdf) {
      const upLink = await PDFData.findOneAndUpdate(
        { pdfId: "PDFID" },
        {
          $set: {
            pdfLink: req.body.pdfLink,
          },
        }
      );
      if (upLink) {
        res.status(200).json({ message: "PDF link updated" });
      } else {
        res.status(200).json({ message: "Cannot update pdf link" });
      }
    } else {
      const createLink = await PDFData.create({
        pdfLink: req.body.pdfLink,
      });
      if (createLink) {
        res.status(200).json({ message: "PDF link uploaded" });
      } else {
        res.status(200).json({ message: "Cannot upload pdf link" });
      }
    }
  } catch (error) {
    //console.log(error)
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getAllDirectReward = async (req, res) => {
  try {
    const allDirectReward = await LevelIncome.find({ incomeType: "Direct reward" }).sort({
      createdAt: -1,
    });

    // Check if there are no results for the given criteria.
    if (allDirectReward.length === 0) {
      return res.status(404).json({
        message: "No direct rewards found.",
      });
    }

    // If you want to return the results, you can send them in the response.
    return res.status(200).json(allDirectReward);
  } catch (error) {
    console.error("Error in getAllDirectReward:", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
const createTokenPrice = async (req, res) => {
  try {
    const { id, usdt_price_per_hashtoken } = req.body;
    const newTokenPrice = new tokenPrice({ id, usdt_price_per_hashtoken });
    const savedTokenPrice = await newTokenPrice.save();
    res.status(201).json(savedTokenPrice);
  } catch (error) {
    res.status(500).json({ error: "Could not create TokenPrice" });
  }
}

const getTokenPirce = async (req, res) => {
  try {
    const tokenPrices = await tokenPrice.find();
    res.status(200).json(tokenPrices);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch TokenPrices" });
  }
}
const updateTokenPirce = async (req, res) => {
  try {
    const idToUpdate = "abcd"; // Set the ID you want to update
    const { usdt_price_per_hashtoken } = req.body;

    if (!usdt_price_per_hashtoken) {
      return res.status(400).json({ error: "usdt_price_per_hashtoken is required" });
    }

    const updatedTokenPrice = await tokenPrice.findOneAndUpdate(
      { id: idToUpdate }, // Use _id to find the document
      { usdt_price_per_hashtoken },
      { new: true }
    );

    if (!updatedTokenPrice) {
      return res.status(404).json({ error: "TokenPrice not found" });
    }

    res.status(200).json(updatedTokenPrice);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Could not update TokenPrice" });
  }
};

const deleteTokenPrice = async (req, res) => {
  try {
    const id = 'abcd'
    const deletedTokenPrice = await tokenPrice.findByIdAndRemove(id);
    if (!deletedTokenPrice) {
      res.status(404).json({ error: "TokenPrice not found" });
    } else {
      res.status(204).end();
    }
  } catch (error) {
    res.status(500).json({ error: "Could not delete TokenPrice" });
  }
}
const changePopUpImg = async (req, res) => {
  try {
    if (!req.file?.path)
      res.status(400).json({
        message: "Image is missing",
      });
    const findImage = await PopupImage.findOne({ image_id: "TLCPOPUPIMAGE" });
    if (findImage?.avatar_public_url) {
      await Cloudinary.uploader.destroy(findImage.avatar_public_url);
    }
    const image = await Cloudinary.uploader.upload(req.file.path);
    const avatar = {
      avatar: image.secure_url,
      avatar_public_url: image.public_id,
    };
    if (findImage) {
      const upImage = await PopupImage.findOneAndUpdate(
        { image_id: "TLCPOPUPIMAGE" },
        {
          $set: {
            avatar: avatar.avatar,
            avatar_public_url: avatar.avatar_public_url,
          },
        }
      );
      if (upImage) {
        res.status(200).json({ message: "Image uploaded" });
      } else {
        res.status(200).json({ message: "Cannot upload Image" });
      }
    } else {
      const upImage = await PopupImage.create({
        avatar: avatar.avatar,
        avatar_public_url: avatar.avatar_public_url,
      });
      if (upImage) {
        res.status(200).json({ message: "Image uploaded" });
      } else {
        res.status(200).json({ message: "Cannot upload Image" });
      }
    }
  } catch (error) {
    //console.log(error)
    return res.status(500).json({ message: error.message.toString() });
  }
};
module.exports = {
  swapHistoryByAdmin,
  updateSystemWalletAPI,
  updatePopUpImage,
  getAllActiveUser,
  getDashboardData,
  getAllDepositByAdmin,
  approveDepositRequestByAdmin,
  getBlockedUser,
  changeUserStatus,
  deleteUser,
  editUser,
  updateEmail,
  changePassword,
  getAllUser,
  allWithdrawHistory,
  successWithdrawHistory,
  rejectWithdrawHistory,
  changeWithdrawStatus,
  createFundTransfer,
  getAllFundTransferHistory,
  getAllStakingHistory,
  getAllStakingLevelEarning,
  getAllStakeSelfEarning,
  uploadPromotionalSchemeImage,
  deletePromotionalSchemeImage,
  getAllPromotionalScheme,
  getAllContactUsHistory,
  getAllSupportHistory,
  createUpdate,
  changePdfLink,
  getAllDirectReward,

  createTokenPrice,
  getTokenPirce,
  updateTokenPirce,
  deleteTokenPrice,
  changePopUpImg
};
