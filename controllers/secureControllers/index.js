const bcrypt = require("bcryptjs");
const User = require("../../models/userModel");
const Otp = require("../../models/otpModel");
const generateString = require("../../config/generateRandomString");
const Wallet = require("../../models/walletModel");
const getIstTime = require("../../config/getTime");
const getLoggedInUser = require("../../config/getUser");
const SystemInfo = require("../../models/SystemInfo");
const DepositHistory = require("../../models/DepositHistory");
const SwapHistory = require("../../models/SwapHistory");
const LevelIncome = require("../../models/levelIncome");
const WithdrawHistory = require("../../models/WithdrawHistory");
const { validationResult } = require("express-validator");
const ValidationErrorMsg = require("../../helpers/ValidationErrorMsg");
const { StakingPlan, StakingReward } = require("../../models/StakingModel");
const { STAKE_CONSTANT } = require("../../constant/staking.constant");
const Level = require("../../models/levelModel");
const SystemWallet = require("../../models/SystemInfo");
const { FundTransfer } = require("../../models/fundTransferModel");
const Contact = require("../../models/contactus.model");
const Update = require("../../models/updates.model");
const cloudinary = require("../../config/cloudinary");
const SupportTicket = require("../../models/supportTicket.model");
const { PromotionScheme } = require("../../models/promotionalScheme");
const IncomeHistory = require("../../models/IncomeHistory");
const sendEmailNotification = require("../../config/mailNotification");
const TokenPrice = require("../../models/tokenPrice");
const PopupImage = require("../../models/popupImageModel");

const testAPI = async (req, res) => {
  return res.status(200).json({
    message: "completed",
  });
};

// const walletCollection = async () => {
//   const wallets = await Wallet.find({});
//   for (const wlt of wallets) {
//     // console.log('userid', wlt.user_id, wlt?.total_active_hash_token)
//     await Wallet.findOneAndUpdate(
//       {
//         user_id: wlt.user_id

//       },
//       {
//         $set: {
//           name: wlt.name,
//           user_id: wlt.user_id,
//           sponsor_id: wlt.sponsor_id,
//           totalStakeAmount: wlt.totalStakeAmount || 0,
//           total_deposited_dollar: wlt.total_deposited_dollar || 0,
//           total_deposited_hpt: wlt.total_deposited_hpt || 0,
//           usdtBalance: wlt.usdtBalance || 0,
//           busdBalance: wlt.busdBalance || 0,
//           stakingRoiIncome: wlt.stakingRoiIncome || 0,
//           stakingRewardIncome: wlt.stakingRewardIncome || 0,
//           directIncome: wlt.directIncome || 0,
//           teamIncome: wlt.teamIncome || 0,
//           allToken: wlt.allToken || 0,
//           totalHashProToken: wlt.total_active_hash_token + wlt.referralToken + wlt.joiningBonus || 0,
//           joiningBonus: wlt.joiningBonus || 0,
//         }
//       },
//     )
//   }
//   console.log('finished operation')
// }

const GetDashboardByUser = async (req, res) => {
  try {
    const team = await User.find({ sponsor_id: req.auth.id });
    const income = await Wallet.findOne({ user_id: req.auth.id }).select(
      "total_deposited_dollar totalHashProToken referralToken referralUsdt joiningBonus"
    );
    const data = {
      income,
      team: team.length,
      totalHashToken:
        income?.joiningBonus +
        income?.totalHashProToken +
        income?.referralToken,
    };
    if (data) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const getDirectIncome = async (req, res) => {
  try {
    const income = await LevelIncome.find({ userId: req.auth.id }).sort({
      createdAt: -1,
    });
    if (income) {
      return res.status(200).json({ data: income });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const getDirectTeam = async (req, res) => {
  try {
    const team = await User.find({ sponsor_id: req.auth.id })
      .select("-password -token -user_status -delete_status")
      .sort({ createdAt: -1 });
    if (team) {
      return res.status(200).json({ data: team });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const swapHistoryByUser = async (req, res) => {
  try {
    const user = await getLoggedInUser(req.auth.id);
    const histories = await SwapHistory.find({ user_id: user.user_id }).sort({
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

const SwapTokenAPI = async (req, res) => {
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
    const { deductAmount, deductCurrency, creditCurrency } = req.body;
    const user = getLoggedInUser(req.auth.id);
    const systemWallet = await SystemInfo.findOne({ infoId: "system-info" });

    let fromField, toField, toExchangeTypeField;
    let multiplier = 1;

    switch (`${deductCurrency}-${creditCurrency}`) {
      case "token-usdt":
        fromField = "totalHashProToken";
        toField = "usdtBalance";
        toExchangeTypeField = "usdt";
        multiplier = systemWallet?.per_hash_token_price_in_USDT;
        break;
      case "usdt-token":
        fromField = "usdtBalance";
        toField = "totalHashProToken";
        toExchangeTypeField = "token";
        multiplier = 1 / (systemWallet?.per_hash_token_price_in_USDT || 1);
        break;
      case "token-busd":
        fromField = "totalHashProToken";
        toField = "busdBalance";
        toExchangeTypeField = "busd";
        multiplier = systemWallet?.per_hash_token_price_in_USDT;
        break;
      case "busd-token":
        fromField = "busdBalance";
        toField = "totalHashProToken";
        toExchangeTypeField = "token";
        multiplier = 1 / (systemWallet?.per_hash_token_price_in_USDT || 1);
        break;
      default:
        return res.status(400).json({ error: "Invalid token swap" });
    }

    const amount = deductAmount * multiplier;

    await Wallet.findOneAndUpdate(
      { user_id: req.auth.id },
      {
        $inc: {
          [fromField]: -deductAmount,
          [toField]: +amount,
        },
      }
    );

    await SwapHistory.create({
      user_id: req.auth.id,
      email: user?.email,
      deductAmount: deductAmount,
      deductCurrency: deductCurrency,
      creditAmount: amount,
      creditCurrency: creditCurrency,
      toExchangeType: toExchangeTypeField,
      date: new Date(getIstTime().date).toDateString(),
      time: getIstTime().time,
    });

    res.status(201).json({ message: "Token swap successful" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

// System Wallet
const getSystemWallet = async (req, res) => {
  try {
    const system = await SystemWallet.findOne({ infoId: "system-info" });
    return res.status(200).json({ data: system });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

const getUserWalletByUser = async (req, res) => {
  try {
    const user = await getLoggedInUser(req.auth.id);
    const userWallet = await Wallet.findOne({ user_id: user.user_id });
    return res.status(200).json({
      data: userWallet,
      message: "User wallet",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const depositHistoryByUser = async (req, res) => {
  try {
    const user = await getLoggedInUser(req.auth.id);
    const histories = await DepositHistory.find({ user_id: user.user_id }).sort(
      {
        createdAt: -1,
      }
    );

    return res.status(200).json({
      data: histories,
      message: "Deposit history",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};
const depositHPT = async (req, res) => {
  try {
    const { payment_method, deposited_amount, trxId } =
      req.body;

    if (!payment_method) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    if (!deposited_amount) {
      return res.status(400).json({
        message: "Deposit amount is required",
      });
    }
    if (deposited_amount < 1) {
      return res.status(400).json({
        message: "Minimum deposit amount is HPT: 1",
      });
    }
    // check existing transaction history
    const extTrx = await DepositHistory.findOne({ trxId: trxId })
    if (extTrx) {
      return res.status(400).json({ message: "Already Exist This Transaction ID" })
    }

    const { name, user_id, email } = await getLoggedInUser(req.auth.id);
    const { date, time } = getIstTime();

    const result = await DepositHistory.create({
      name,
      user_id,
      email,
      payment_method,
      deposited_amount,
      currency_type: "HPT",
      deposit_amount_htp: deposited_amount,
      trxId,
      date: new Date(date).toDateString(),
      time,
    });
    // Send email notification 
    sendEmailNotification(user_id, name, `New Deposit request from ${user_id}`, deposited_amount)
    if (!result) {
      return res.status(400).json({
        message: "Deposit not created",
      });
    }

    return res.status(200).json({
      message: "Deposit request created",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};
const depositUSD = async (req, res) => {
  try {
    const { payment_method, deposited_amount, trxId } =
      req.body;

    if (!payment_method) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    if (!deposited_amount) {
      return res.status(400).json({
        message: "Deposit amount is required",
      });
    }
    if (deposited_amount < 1) {
      return res.status(400).json({
        message: "Minimum deposit amount is $1",
      });
    }
    // check existing transaction history
    const extTrx = await DepositHistory.findOne({ trxId: trxId })
    if (extTrx) {
      return res.status(400).json({ message: "Already Exist This Transaction ID" })
    }

    const { name, user_id, email } = await getLoggedInUser(req.auth.id);
    const { date, time } = getIstTime();

    const result = await DepositHistory.create({
      name,
      user_id,
      email,
      payment_method,
      deposited_amount,
      deposit_amount_hpt_to_dollar: payment_method.toLowerCase() === "hpt" ? deposited_amount * 0.25 : 0,
      currency_type: payment_method.toLowerCase() === "hpt" ? "HPT" : "USD",
      deposit_amount_hpt: payment_method.toLowerCase() === "hpt" ? deposited_amount : 0,
      deposit_amount_dollar: payment_method.toLowerCase() !== "hpt" ? deposited_amount : 0,
      trxId,
      date: new Date(date).toDateString(),
      time,
    });

    // Send email notification 
    sendEmailNotification(user_id, name, `New Deposit request from ${user_id}`, deposited_amount)
    if (!result) {
      return res.status(400).json({
        message: "Deposit not created",

      });
    }

    return res.status(200).json({
      message: "Deposit request created",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const depositINR = async (req, res) => {
  try {
    const { payment_method, deposited_amount, trxId } =
      req.body;

    if (!payment_method) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    if (!deposited_amount) {
      return res.status(400).json({
        message: "Deposit amount is required",
      });
    }
    if (deposited_amount < 500) {
      return res.status(400).json({
        message: "Minimum deposit amount is 500 INR",
      });
    }
    // check existing transaction history
    const extTrx = await DepositHistory.findOne({ trxId: trxId })
    if (extTrx) {
      return res.status(400).json({ message: "Already Exist This Transaction ID" })
    }

    const { name, user_id, email } = await getLoggedInUser(req.auth.id);
    const { INR_for_per_dollar } = await SystemInfo.findOne({
      infoId: "system-info",
    });
    const deposit_amount_dollar = deposited_amount / INR_for_per_dollar;
    const { date, time } = getIstTime();

    const result = await DepositHistory.create({
      name,
      user_id,
      email,
      payment_method,
      deposited_amount,
      currency_type: "INR",
      deposit_amount_dollar,
      trxId,
      date: new Date(date).toDateString(),
      time,
    });

    if (!result) {
      return res.status(400).json({
        message: "Deposit not created",
      });
    }

    return res.status(200).json({
      message: "Deposit request created",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

const updateUserInfo = async (req, res) => {
  try {
    const data = req.body;
    // const user = User.findOne(({user_id: data.user_id}));
    // if(user){
    const updatedUser = await User.updateOne({ user_id: data.user_id }, data);
    if (updatedUser) {
      res.status(200).json({
        message: "User information updated",
      });
    } else {
      res.status(400).json({
        message: "Cannot update user information",
      });
    }
  } catch (error) {
    //console.log(error);
    res.status(400).json({
      message: error.toString(),
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password, otpCode } = req.body;
    const user_id = req.auth.id;
    console.log("userid", user_id);
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
      // check OTP
      const otp = await Otp.findOne({ email: new_email });
      if (parseFloat(otp?.code) === parseFloat(otpCode)) {
        if (user && user.email === current_email) {
          await User.findOneAndUpdate(
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
    res.status(400).json({
      message: e.toString(),
    });
  }
};

// update user profile picture
const updateProfilePic = async (req, res) => {
  try {
    const user_id = req.auth.id;
    if (!req.file?.path) res.status(400).json({
      message: "Image is missing",
    });
    const findUser = await User.findOne({ user_id: user_id });
    if (findUser?.avatar_public_url) {
      await cloudinary.uploader.destroy(findUser.avatar_public_url);
    }
    const image = await cloudinary.uploader.upload(req.file.path);
    const avatar = {
      avatar: image.secure_url,
      avatar_public_url: image.public_id,
    };
    const upImage = await User.findOneAndUpdate({ user_id: user_id }, {
      $set: {
        avatar: avatar.avatar,
        avatar_public_url: avatar.avatar_public_url
      }
    });
    if (upImage) {
      return res.status(200).json({ message: "Image uploaded" });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message });
  }
};

const withdrawAmount = async (req, res) => {
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
    const { amount, trx_address, type, otpCode } = req.body;
    const user_id = req.auth.id;
    // find user
    const user = await User.findOne({ user_id: user_id });
    // check OTP
    const otp = await Otp.findOne({ email: user.email });
    if (parseFloat(otp?.code) === parseFloat(otpCode)) {
      if (parseFloat(amount) >= 1) {
        if (user) {
          const wallet = await Wallet.findOne({ user_id: user_id });
          if (user.user_status) {
            if (type == "usdt") {
              if (parseFloat(amount) < 10) {
                res.status(403).json({ message: "You must withdraw a minimum of 10 USDT." })
              } else if (user?.usdtWallet === trx_address) {
                if (parseFloat(wallet.usdtBalance) >= parseFloat(amount)) {
                  const time = getIstTime();
                  const updateWithdraw = await WithdrawHistory.create({
                    name: user.name,
                    user_id: user.user_id,
                    sponsor_id: user.sponsor_id,
                    email: user.email,
                    request_amount: amount,
                    withdraw_charge: 10,
                    amount_after_charge:
                      parseFloat(amount) - (parseFloat(amount) / 100) * 10,
                    current_balance:
                      parseFloat(wallet.usdtBalance) - parseFloat(amount),
                    transaction_id: generateString(15),
                    hashTID: "",
                    trx_address: trx_address,
                    type: type,
                    date: new Date().toDateString(),
                    time: time.time,
                  });
                  // update wallet
                  if (updateWithdraw) {
                    await Wallet.findOneAndUpdate(
                      { _id: wallet._id },
                      {
                        $inc: {
                          usdtBalance: -parseFloat(amount),
                        },
                      }
                    );

                    res.status(200).json({
                      message: "Withdraw request Successful",
                    });
                  } else {
                    res.status(400).json({
                      message: "Cannot Update wallet",
                    });
                  }
                } else {
                  res.status(400).json({
                    message: "Insufficient balance",
                  });
                }
              } else {
                return res
                  .status(400)
                  .json({ message: "Invalid wallet address" });
              }
            } else if (type == "busd") {
              if (parseFloat(amount) < 10) {
                res.status(403).json({ message: "You must withdraw a minimum of 10 BUSD." })
              } else if (user?.busdWallet === trx_address) {
                if (parseFloat(wallet.busdBalance) >= parseFloat(amount)) {
                  const time = getIstTime();
                  const updateWithdraw = await WithdrawHistory.create({
                    name: user.name,
                    user_id: user.user_id,
                    sponsor_id: user.sponsor_id,
                    email: user.email,
                    request_amount: amount,
                    withdraw_charge: 10,
                    amount_after_charge:
                      parseFloat(amount) - (parseFloat(amount) / 100) * 10,
                    current_balance:
                      parseFloat(wallet.busdBalance) - parseFloat(amount),
                    transaction_id: generateString(15),
                    hashTID: "",
                    trx_address: trx_address,
                    type: type,
                    date: new Date().toDateString(),
                    time: time.time,
                  });
                  // update wallet
                  if (updateWithdraw) {
                    await Wallet.findOneAndUpdate(
                      { _id: wallet._id },
                      {
                        $inc: {
                          busdBalance: -parseFloat(amount),
                        },
                      }
                    );

                    res.status(200).json({
                      message: "Withdarw request Successfull",
                    });
                  } else {
                    res.status(400).json({
                      message: "Cannot Update wallet",
                    });
                  }
                } else {
                  res.status(400).json({
                    message: "Insufficient balance",
                  });
                }
              } else {
                return res
                  .status(400)
                  .json({ message: "Invalid wallet address" });
              }
            }
            // for withdrow HPT
            else if (type == "hpt") {
              if (parseFloat(amount) < 10) {
                res.status(403).json({ message: "You must withdraw a minimum of 10 HPT." })
              } else if (user?.hptWallet === trx_address) {
                if (parseFloat(wallet.totalHashProToken) >= parseFloat(amount)) {
                  const time = getIstTime();
                  const updateWithdraw = await WithdrawHistory.create({
                    name: user.name,
                    user_id: user.user_id,
                    sponsor_id: user.sponsor_id,
                    email: user.email,
                    request_amount: amount,
                    withdraw_charge: 10,
                    amount_after_charge:
                      parseFloat(amount) - (parseFloat(amount) / 100) * 10,
                    current_balance:
                      parseFloat(wallet.totalHashProToken) - parseFloat(amount),
                    transaction_id: generateString(15),
                    hashTID: "",
                    trx_address: trx_address,
                    type: type,
                    date: new Date().toDateString(),
                    time: time.time,
                  });
                  // update wallet
                  if (updateWithdraw) {
                    await Wallet.findOneAndUpdate(
                      { _id: wallet._id },
                      {
                        $inc: {
                          totalHashProToken: -parseFloat(amount),
                        },
                      }
                    );

                    res.status(200).json({
                      message: "Withdarw request Successfull",
                    });
                  } else {
                    res.status(400).json({
                      message: "Cannot Update wallet",
                    });
                  }
                } else {
                  res.status(400).json({
                    message: "Insufficient balance",
                  });
                }
              } else {
                return res
                  .status(400)
                  .json({ message: "Invalid wallet address" });
              }
            }
          } else {
            res.status(400).json({
              message: "Your account is not active yet!",
            });
          }
        } else {
          res.status(400).json({
            message: "Invalid user credentials",
          });
        }
      } else {
        res.status(400).json({
          message: "Minimum withdraw amount is HPT 1",
        });
      }
    } else {
      res.status(400).json({
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    console.log(error)
    return res.status(403).json({ error: "Some error message" });


  }
};

const withdrawHistory = async (req, res) => {
  try {
    const user_id = req.auth.id;
    if (!user_id) {
      res.status(400);
      throw new Error("Data not found");
    }
    const withdrawInfo = await WithdrawHistory.find({ user_id: user_id }).sort({
      createdAt: -1,
    });

    if (withdrawInfo) {
      res.status(200).json({
        history: withdrawInfo,
      });
    } else {
      res.status(400).json({
        message: "Cannot find withdraw information",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.toString(),
    });
  }
};

const createStakingAmount = async (req, res) => {
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
    const { duration = 12, amount } = req.body;


    if (amount < 1) {
      res.status(403).json({ message: "Minimum 1 Hash Pro Token Stack" });
    }
    // find wallet
    await Wallet.findOneAndUpdate(
      { user_id: req.auth.id },
      {
        $inc: {
          totalHashProToken: -Number(amount),
          totalStakeAmount: +Number(amount),
        },
      }
    );
    // calculate return date:---------
    const currentDate =
      duration === STAKE_CONSTANT.twelve.duration
        ? 12
        : duration === STAKE_CONSTANT.twentyFour.duration
          ? 24
          : 36;
    const returnD = new Date(getIstTime().date);
    returnD.setMonth(returnD.getMonth() + currentDate);
    // Calculate return amount
    const returnM =
      duration === STAKE_CONSTANT.twelve.duration
        ? (Number(amount) / 100) * STAKE_CONSTANT.twelve.percentage +
        Number(amount)
        : duration === STAKE_CONSTANT.twentyFour.duration
          ? (Number(amount) / 100) * STAKE_CONSTANT.twentyFour.percentage +
          Number(amount)
          : (Number(amount) / 100) * STAKE_CONSTANT.thirtySix.percentage +
          Number(amount);
    // Create stake
    const user = await User.findOne({ user_id: req.auth.id });
    // console.log('user hello', user)
    await StakingPlan.create({
      userId: req.auth.id,
      fullName: user?.name,
      sponsorId: user?.sponsor_id,
      sponsorName: user?.sponsor_name,
      stakeAmount: amount,
      stakeDate: {
        mileSecond: new Date(getIstTime().date).getTime(),
        formattedDate: new Date(getIstTime().date).toDateString(),
      },
      stakeDuration: duration,
      returnDate: {
        mileSecond: returnD.getTime(),
        formattedDate: returnD.toDateString(),
      },
      returnAmount: returnM,
    });
    // Distribute level stake 10% comission to sponsor
    const levelMoney = amount / 100 * 10;

    await Wallet.findOneAndUpdate(
      { user_id: user?.sponsor_id },
      {
        $inc: {
          directIncome: +levelMoney,
          teamIncome: +levelMoney,
          allToken: +levelMoney,
          totalHashProToken: +levelMoney,
        }
      },
      { new: true }
    )

    const sponsorOfSponsor = await User.findOne({ user_id: user?.sponsor_id })
    await LevelIncome.create({
      userId: user?.sponsor_id,
      fullName: user?.sponsor_name,
      incomeType: "Direct reward",
      amountOfToken: levelMoney,
      sponsorId: sponsorOfSponsor?.sponsor_name,
      incomeFrom: {
        userId: req.auth.id,
        fullName: user?.name,
        email: user?.email,
        level: 1,
        sponsorId: user?.sponsor_id,
        stackingAmount: amount
      },
      date: new Date(getIstTime().date).toDateString(),
      time: getIstTime().time
    })
    return res.status(201).json({ message: "Staking successfully" });
  } catch (error) {

    console.log("error", error)
    return res.status(500).json({ message: "Something went wrong" });
  }
};
// Get stake history
const getStakeHistory = async (req, res) => {
  try {
    const result = await StakingPlan.find({ userId: req.auth.id }).sort({ createdAt: -1 });
    if (result.length > 0) {
      return res.status(200).json({ data: result });
    } else {
      return res.status(400).json({ message: "There is no stake history" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
// Create unstake
const createUnStakeAmount = async (req, res) => {
  try {
    // find existing stake amount history
    const extStake = await StakingPlan.findOne({ _id: req.body.id });
    // Checking if staking is available for unStake within 30 days after the stake amount
    const returnD = new Date(extStake?.stakeDate?.mileSecond);
    returnD.setDate(returnD.getDate() + 30);
    if (new Date(getIstTime().date).getTime() >= returnD.getTime()) {
      return res
        .status(400)
        .json({ message: "You can't un-stake after 30 days" });
    }
    // from the client must have to send stake history _id to the server
    const unStake = await StakingPlan.findOneAndUpdate(
      { _id: req.body.id, userId: req.auth.id, isActive: true },
      { $set: { isUnStaked: true, isActive: false } },
      { new: true }
    );
    const afterChargeStakeAmount = unStake?.stakeAmount - (unStake?.stakeAmount / 100) * 10;
    await Wallet.findOneAndUpdate(
      { user_id: req.auth.id },
      { $inc: { totalHashProToken: +afterChargeStakeAmount } }
    );
    return res.status(200).json({ message: "Unstaking successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Get my team information
const getMyTeamInfo = async (req, res) => {
  try {
    const { id: userId } = req.auth;

    const [me, sponsor, { level = [] } = {}] = await Promise.all([
      User?.findOne({ user_id: userId }),
      User?.findOne({
        user_id: (await User.findOne({ user_id: userId })).sponsor_id,
      }),
      Level?.findOne({ user_id: userId }),
    ]);

    const data = {
      sponsor: {
        fullName: sponsor?.name || "",
        userId: sponsor?.user_id || "",
        mobile: sponsor?.mobile || "",
      },
      totalTeam: level?.length || 0,
      directTeam: level?.filter((d) => d.level === "1").length || [],
    };

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
// Get team levels information
const getTeamLevelsInfo = async (req, res) => {
  try {
    const levelInfo = [];
    const findLevel = await Level.findOne({ user_id: req.auth.id });
    for (let i = 1; i <= 12; i++) {
      const levels = findLevel?.level?.filter((d) => d.level === `${i}`) || [];
      const totalTeam = +levels?.length; // total Team

      // Get total business of level [i]
      let totalBusinessAmount = 0;
      for (const singleLevel of levels) {
        const [totalStake] = await StakingPlan.aggregate([
          {
            $match: {
              userId: singleLevel?.user_id,
              isActive: true,
              isUnStaked: false
            },
          },
          {
            $group: {
              _id: null,
              totalStake: { $sum: "$stakeAmount" },
            },
          },
        ]);
        if (totalStake && totalStake.totalStake !== undefined) {
          totalBusinessAmount += totalStake.totalStake;
        }
      }
      const data = {
        level: i,
        totalTeam: totalTeam,
        totalBusinessAmount: totalBusinessAmount,
      };
      levelInfo.push(data);
      // break;
    }
    return res.status(200).json({ data: levelInfo });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};

// Get level details
const getTeamLevelDetails = async (req, res) => {
  try {
    const level = String(req.query.level);
    if (!level) {
      return res.status(400).json({ message: "Level is missing" });
    }
    const teams = await Level.findOne({ user_id: req.auth.id });
    const totalTeamMembers = teams?.level?.length; // Total team members

    const members = teams?.level?.filter((d) => d.level === level) || [];
    const directMembers = members?.length; // Total level members of each level

    let totalBusinessAmount = 0;
    let activeMembers = 0;
    let levelUsers = [];
    for (const member of members) {
      const [totalStake] = await StakingPlan.aggregate([
        {
          $match: {
            userId: member?.user_id,
            isActive: true,
            isUnStaked: false
          },
        },
        {
          $group: {
            _id: null,
            totalStake: { $sum: "$stakeAmount" }, // total amount of stake
            memberCount: { $addToSet: "$userId" }, // Count of members
          },
        },
        {
          $project: {
            _id: 0,
            memberCount: { $size: "$memberCount" }, // Count of unique user IDs
            totalStake: 1, // Include the totalStake field
          },
        },
      ]);
      if (totalStake && totalStake.totalStake !== undefined) {
        totalBusinessAmount += totalStake.totalStake || 0;
        activeMembers += totalStake.memberCount || 0;
      }
      // Get particular member info
      const teams = await Level.findOne({ user_id: member?.user_id });
      const data = {
        fullName: member.name,
        userId: member?.user_id,
        joiningDate: member?.joining_date,
        mobile: level === "1" ? member?.mobile : "N/A",
        level: level,
        totalTeam: teams?.level?.length,
        stakeToken: totalStake?.totalStake,
      };
      levelUsers.push(data);
    }
    return res.status(200).json({
      totalTeamMembers,
      directMembers,
      totalBusinessAmount,
      activeMembers,
      levelUsers,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};

// get statistics
const getStatistics = async (req, res) => {
  try {
    const tokenBalance = await Wallet.findOne({ user_id: req.auth.id });
    // Get total business of level [n]
    const findLevel = await Level.findOne({ user_id: req.auth.id }) || [];
    let totalBusinessAmount = 0;
    for (const singleLevel of findLevel?.level || []) {
      const [totalStake] = await StakingPlan.aggregate([
        {
          $match: {
            userId: singleLevel?.user_id,
          },
        },
        {
          $group: {
            _id: null,
            totalStake: { $sum: "$stakeAmount" },
          },
        },
      ]);
      if (totalStake && totalStake.totalStake !== undefined) {
        totalBusinessAmount += totalStake.totalStake;
      }
    }
    return res.status(200).json({
      totalStakeToken: tokenBalance?.totalStakeAmount || 0,
      tokenBalance: tokenBalance?.totalHashProToken || 0,
      teamStakeAmount: totalBusinessAmount || 0,
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: "Something went wrong" });
  }
};
// Get withdraw details
const getWithdrawDetails = async (req, res) => {
  try {
    const [withdraw] = await WithdrawHistory.aggregate([
      {
        $match: {
          user_id: req.auth.id,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$request_amount" },
          pendingAmount: {
            $sum: {
              $cond: [
                { $eq: ["$status", "pending"] }, // Assuming "pending" status for pending withdrawals
                "$request_amount",
                0,
              ],
            },
          },
          successAmount: {
            $sum: {
              $cond: [
                { $eq: ["$status", "success"] }, // Assuming "success" status for successful withdrawals
                "$request_amount",
                0,
              ],
            },
          },
          history: {
            $push: {
              _id: "$_id",
              name: "$name",
              request_amount: "$request_amount",
              date: "$date",
              type: "$type",
              status: "$status",
            },
          },
        },
      },
    ]);
    if (withdraw) {
      return res.status(200).json({ withdraw });
    } else {
      return res.status(400).json({ message: "There is no withrawal details" })
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// update busd or usdt wallet address
const updateWallet = async (req, res) => {
  try {
    const { usdtWallet, busdWallet, hptWallet } = req.body;
    await User.findOneAndUpdate(
      { user_id: req.auth.id },
      {
        $set: {
          usdtWallet: usdtWallet,
          busdWallet: busdWallet,
          hptWallet: hptWallet,
        },
      }
    );
    return res
      .status(200)
      .json({ message: "Wallet address updated successfully" });
  } catch (error) {
    return res.status(200).json({ message: "Something went wrong" });
  }
};

// get reward
const getReward = async (req, res) => {
  try {
    const userId = req.auth.id;

    // Use Promise.all for parallel database queries
    const [rewardStats, selfSignUpToken, incomes, rewards, rois] = await Promise.all([
      Wallet.findOne({ user_id: userId }),
      IncomeHistory.findOne({ user_id: userId }).sort({ createdAt: -1 }),
      LevelIncome.find({ userId }).sort({ createdAt: -1 }),
      StakingReward.find({ userId }).sort({ createdAt: -1 }),
      StakingPlan.find({ userId }).select("history"),
    ]);
    // console.log('rois', rois)

    // Combine incomes and rewards into a single array and sort it
    const dataHistory = [...incomes, ...rewards, ...rois[0]?.history, selfSignUpToken].sort((a, b) => b?.createdAt - a?.createdAt);


    if (rewardStats) {
      return res.status(200).json({
        totalReward: rewardStats.allToken || 0,
        stakingReward: rewardStats.stakingRoiIncome || rewardStats.stakingRewardIncome || 0,
        directReward: rewardStats.directIncome || 0,
        teamReward: rewardStats.teamIncome || 0,
        availableForWithdraw: Number(rewardStats.totalHashProToken || 0),
        history: dataHistory,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/******
 * 1. My total staking
 * 2. Total staking reward
 * 3. My total team
 * 4. Total direct reward
 * 5. Total users of entire system
 * 6. Total stake hash pro token of entire system
 * 7. Total stake usd of entire system
 */
const getWalletDetails = async (req, res) => {
  try {
    // Get system wallet
    const systemWallet = await SystemWallet.findOne({ infoId: "system-info" });
    const info = await Wallet.findOne({ user_id: req.auth.id });
    // total teams
    const team = await Level.findOne({ user_id: req.auth.id });
    // total user's entire system
    const totalUsers = await User.find({ user_id: { $ne: "admin" } });
    // Get total stake hash pro token
    const [stakeToken] = await StakingPlan.aggregate([
      {
        $match: {
          isActive: true,
          isUnStaked: false
        },
      },
      {
        $group: {
          _id: null,
          totalStakeToken: { $sum: "$stakeAmount" },
        },
      },
    ]);

    const totalStakeTokenUsd = Number(stakeToken?.totalStakeToken) * Number(systemWallet?.per_hash_token_price_in_USDT) || 0
    return res.status(200).json({
      myTotalStake: info?.totalStakeAmount || 0,
      myStakingIncome: info?.stakingRoiIncome || 0,
      myTotalTeam: team?.level?.length || 0,
      myTotalDirectReward: info?.directIncome || 0,
      totalUsersEntireSystem: totalUsers?.length || 0,
      totalStakeTokenEntireSystem: stakeToken?.totalStakeToken || 0,
      totalStakeTokenInUSD: totalStakeTokenUsd,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};

// Get home details
const getdashboardDetails = async (req, res) => {
  try {
    // Get system wallet
    const systemWallet = await SystemWallet.findOne({ infoId: "system-info" });
    const info = await Wallet.findOne({ user_id: req.auth.id });
    // total teams
    const team = await Level.findOne({ user_id: req.auth.id });
    // total user's entire system
    const totalUsers = await User.find({ user_id: { $ne: "admin" } });
    // Get total stake hash pro token
    const [stakeToken] = await StakingPlan.aggregate([
      {
        $match: {
          isActive: true,
          isUnStaked: false
        }
      },
      {
        $group: {
          _id: null,
          totalStakeToken: { $sum: "$stakeAmount" },
        },
      },
    ]);
    // get total income entire system
    const [totalIncome] = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalIncome: { $sum: "$allToken" },
        },
      },
    ]);
    // Get total withdraw entire system
    const [totalWithdraw] = await WithdrawHistory.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $cond: [
                { $eq: ["$status", "success"] }, // Assuming "success" status for successful withdrawals
                "$request_amount",
                0,
              ],
            },
          },
        },
      },
    ]);
    const withdrawTotal = Number(totalWithdraw?.totalAmount) / Number(systemWallet?.per_hash_token_price_in_USDT) || 0;
    const stakeTotalInUSD = Number(stakeToken?.totalStakeToken) * Number(systemWallet?.per_hash_token_price_in_USDT) || 0;
    return res.status(200).json({
      myTotalStake: info?.totalStakeAmount || 0,
      myStakingIncome: info?.stakingRoiIncome || 0,
      myTotalTeam: team?.level?.length || 0,
      myTotalDirectReward: info?.directIncome || 0,
      myReward: info?.allToken || 0,
      myTeamReward: info?.teamIncome || 0,
      myTotalHashToken: info?.totalHashProToken || 0,
      totalUsersEntireSystem: totalUsers?.length || 0,
      totalStakeTokenEntireSystem: stakeToken?.totalStakeToken || 0,
      totalStakeTokenInUSD: stakeTotalInUSD,
      totalRewardEntireSystem: totalIncome?.totalIncome || 0,
      totalWithdrawAmountInTokenEntireSystem: withdrawTotal,
    });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
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
    // Deduct amount from sender wallet
    await Wallet.findOneAndUpdate(
      { user_id: req.auth.id },
      {
        $inc: {
          totalHashProToken: -amount,
        },
      },
      { new: true }
    );
    // Add amount to receiver wallet
    await Wallet.findOneAndUpdate(
      { user_id: receiverUserid },
      {
        $inc: {
          totalHashProToken: +amount,
        },
      }
    );
    // history create
    const sender = await User.findOne({ user_id: req.auth.id });
    await FundTransfer.create({
      fundSenderUserId: req.auth.id,
      fundSenderName: sender?.name,
      fundReceiverUserId: receiverUserid,
      fundReceiverName: receiverName,
      amount: amount,
      date: new Date(getIstTime().date).toDateString(),
      time: getIstTime().time,
    });
    return res.status(201).json({ message: "Fund transfer successful" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};
// Get fund transfer history
const getFundTransferHistory = async (req, res) => {
  try {
    const history = await FundTransfer.find({
      fundSenderUserId: req.auth.id,
    }).sort({ createdAt: -1 });
    if (history.length > 0) {
      return res.status(200).json({ data: history });
    } else {
      return res.status(400).json({ message: "There is no fund history" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
// Get fund transfer history
const receivedFundTransferHistory = async (req, res) => {
  try {
    const history = await FundTransfer.find({
      fundReceiverUserId: req.auth.id,
    }).sort({ createdAt: -1 });
    if (history.length > 0) {
      return res.status(200).json({ data: history });
    } else {
      return res.status(400).json({ message: "There is no fund history" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

// create contact us mesasge
const createContactUs = async (req, res) => {
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
    const { message, name, user_id, email } = req.body;
    const userId = req.auth.id;
    const subject = "About Hash Pro";

    // find user
    const user = await User.findOne({ user_id: user_id });

    if (user && user_id === userId) {
      // already have Contact collection or not
      const existingContact = await Contact.findOne({ userId: user_id });
      if (!existingContact) {
        const newContact = await Contact.create({
          userId: user.user_id,
          userName: name,
          history: [
            {
              userId: user.user_id,
              userName: name,
              email,
              message,
              subject,
              date: new Date(getIstTime().date).toDateString(),
              time: getIstTime().time,
            },
          ],
        });
        if (newContact) {
          return res.status(200).json({
            message: "Contact us message created successfully",
          });
        } else {
          return res.status(400).json({
            message: "Cannot create contact us message",
          });
        }
      } else {
        // update existing support
        const updateContact = await Contact.findOneAndUpdate(
          { userId: user_id },
          {
            $push: {
              history: {
                userId: user.userId,
                userName: name,
                email: email,
                message: message,
                subject: subject,
                date: new Date(getIstTime().date).toDateString(),
                time: getIstTime().time,
              },
            },
          }
        );
        if (updateContact) {
          return res.status(200).json({
            message: "Contact us message created successfully",
          });
        } else {
          return res.status(400).json({
            message: "Cannot create contact us message",
          });
        }
      }
    } else {
      return res.status(400).json({
        message: "Invalid user credentials",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// get contact us history
const getContactUsHistory = async (req, res) => {
  try {
    const userId = req.auth.id;
    if (userId) {
      const contactUs = await Contact.findOne({ userId: userId }).sort({
        "history.date": -1,
        "history.time": -1,
      });
      if (contactUs) {
        return res.status(200).json(contactUs);
      } else {
        return res.status(400).json({
          message: "Cannot find Contact us history",
        });
      }
    } else {
      return res.status(400).json({
        message: "Cannot find user credentials",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// get updates
const getUpdates = async (req, res) => {
  try {
    const userId = req.auth.id;
    if (userId) {
      const updates = await Update.find({}).sort({ date: -1 });
      if (updates.length > 0) {
        return res.status(200).json({ data: updates });
      } else {
        return res.status(400).json({
          message: "Cannot find any updates",
        });
      }
    } else {
      return res.status(400).json({
        message: "Cannot find user credentials",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Support ticket
const createSupportTicket = async (req, res) => {
  try {
    const { message, remark } = req.body;
    const user_id = req.auth.id;

    if (!req.body)
      return res.status(400).json({
        message: "Please provide data",
      });
    if (!req.file?.path)
      return res.status(400).json({
        message: "Image is missing",
      });
    if (!message)
      return res.status(400).json({
        message: "Question is missing",
      });
    if (!remark)
      return res.status(400).json({
        message: "Remark is missing",
      });

    // find user
    const user = await User.findOne({ user_id: user_id });

    // upload the image
    const image = await cloudinary.uploader.upload(req.file?.path);
    const avatar = {
      avatar: image.secure_url,
      avatar_public_url: image.public_id,
    };

    if (user) {
      // already have support tckect collection or not
      // SN || userid || email || Message || Proof  || date
      const existingSupport = await SupportTicket.findOne({ userId: user_id });
      if (!existingSupport) {
        const newSupportTicket = await SupportTicket.create({
          userId: user.user_id,
          userName: user.name,
          history: [
            {
              userId: user.user_id,
              email: user.email,
              message: message,
              remark: remark,
              proof: avatar,
              date: new Date(getIstTime().date).toDateString(),
              time: getIstTime().time,
            },
          ],
        });
        if (newSupportTicket) {
          return res.status(200).json({
            message: "Support ticket created successfully",
          });
        } else {
          return res.status(400).json({
            message: "Cannot create support ticket",
          });
        }
      } else {
        // update existing support
        const updateSupport = await SupportTicket.findOneAndUpdate(
          { userId: user_id },
          {
            $push: {
              history: {
                userId: user.user_id,
                email: user.email,
                message: message,
                remark: remark,
                proof: avatar,
                date: new Date(getIstTime().date).toDateString(),
                time: getIstTime().time,
              },
            },
          }
        );
        if (updateSupport) {
          return res.status(200).json({
            message: "Support ticket created successfully",
          });
        } else {
          return res.status(400).json({
            message: "Cannot create support ticket",
          });
        }
      }
    } else {
      return res.status(400).json({
        message: "Invalid user credentials",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// get support history
const getSupportHistory = async (req, res) => {
  try {
    // const userId = req.params.user_id;
    const userId = req.auth.id;
    if (userId) {
      const supportTicket = await SupportTicket.findOne({
        userId: userId,
      }).sort({ "history.date": -1, "history.time": -1 });
      if (supportTicket) {
        return res.status(200).json(supportTicket);
      } else {
        return res.status(400).json({
          message: "Cannot find support ticket",
        });
      }
    } else {
      return res.status(400).json({
        message: "Cannot find user credentials",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

const getPromotionalSchemeController = async (_req, res) => {
  try {
    const promo = await PromotionScheme.find({});
    if (promo.length > 0) {
      return res.status(200).json({ data: promo })
    } else {
      return res.status(400).json({ message: "Not found" })
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" })
  }
}


const getTokenPirce = async (req, res) => {
  try {
    const tokenPrices = await SystemWallet.find();
    res.status(200).json(tokenPrices);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch TokenPrices" });
  }
}

const getPopUpImg = async (req, res) => {
  try {
    const findImage = await PopupImage.findOne({ image_id: "TLCPOPUPIMAGE" });
    if (findImage) {
      return res.status(200).json({
        avatar: findImage.avatar,
        avatar_public_url: findImage.avatar_public_url,
      });

    } else {
      return res.status(400).json({ message: "Cannot find Image" });
    }
    // await upImage.save();
  } catch (error) {
    //console.log(error)
    return res.status(500).json({ message: error.message.toString() });
  }
}

module.exports = {
  getDirectTeam,
  getDirectIncome,
  GetDashboardByUser,
  swapHistoryByUser,
  SwapTokenAPI,
  getSystemWallet,
  getUserWalletByUser,
  depositHistoryByUser,
  depositUSD,
  depositINR,
  depositHPT,
  updateUserInfo,
  changePassword,
  updateEmail,
  withdrawAmount,
  withdrawHistory,
  testAPI,
  createStakingAmount,
  getStakeHistory,
  createUnStakeAmount,
  getMyTeamInfo,
  getTeamLevelsInfo,
  getTeamLevelDetails,
  getStatistics,
  getWithdrawDetails,
  updateWallet,
  getReward,
  getWalletDetails,
  getdashboardDetails,
  createFundTransfer,
  getFundTransferHistory,
  receivedFundTransferHistory,
  createContactUs,
  getContactUsHistory,
  getUpdates,
  createSupportTicket,
  getSupportHistory,
  getPromotionalSchemeController,
  updateProfilePic,

  getTokenPirce,
  getPopUpImg,

};
