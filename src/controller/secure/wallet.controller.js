const User = require("../../models/auth.model");
const cloudinary = require("../../config/cloudinary");
const Deposite = require("../../models/deposit.model");
const Wallet = require("../../models/wallet.model");
const generateRandomString = require("../../config/generateRandomId");
const getIstTime = require("../../config/getTime");

// deposite
const depositeAmount = async (req, res) => {
  try {
    const { user_id, amount, hash } = req.body;
    console.log("paht", req.file?.path);
    console.log(user_id, amount, hash);
    if (!req.body)
      return res.status(400).json({
        message: "Please provide data",
      });
    if (!req.file?.path)
      return res.status(400).json({
        message: "Proof image is missing",
      });
    if (!user_id)
      return res.status(400).json({
        message: "User Id is missing",
      });
    if (!amount)
      return res.status(400).json({
        message: "Amount is missing",
      });

    // find user
    const user = await User.findOne({ userId: user_id });

    const image = await cloudinary.uploader.upload(req.file?.path);
    const avatar = {
      avatar: image.secure_url,
      avatarPublicUrl: image.public_id,
    };
    if (user) {
      if (parseInt(amount) >= 25) {
        // find deposit
        const deposite_exist = await Deposite.findOne({ userId: user.userId });
        if (!deposite_exist) {
          const newDeposite = await Deposite.create({
            user: user._id,
            userId: user.userId,
            totalDeposit: parseInt(amount),
            lastDepositAmount: parseInt(amount),
            history: [
              {
                userId: user.userId,
                name: user.fullName,
                amount: parseInt(amount),
                status: "pending",
                date: new Date(getIstTime().date).toDateString(),
                time: getIstTime().time,
                transactionId: generateRandomString(),
                hash: hash,
                proofPic: avatar,
              },
            ],
          });
          if (newDeposite) {
            // update wallet
            const wallet = await Wallet.findOne({ userId: user.userId });
            if (wallet) {
              const updatedDeposite = await Deposite.findOne({
                userId: user.userId,
              });
              const updateWallet = await Wallet.findByIdAndUpdate(
                { _id: wallet._id },
                {
                  $set: {
                    history: updatedDeposite._id,
                  },
                }
              );
              await updateWallet.save();
            } else {
              return res.status(400).json({
                message: "Cannot find wallet",
              });
            }
          }
          return res.status(200).json({
            message: "Deposite request successfull",
          });
        } else {
          const updateDeposite = await Deposite.findByIdAndUpdate(
            { _id: deposite_exist._id },
            {
              $set: {
                totalDeposit:
                  parseInt(deposite_exist.totalDeposit) + parseInt(amount),
                lastDepositAmount: parseInt(amount),
                date: new Date(),
              },
              $push: {
                history: {
                  userId: user.userId,
                  name: user.fullName,
                  amount: parseInt(amount),
                  status: "pending",
                  date: new Date().toDateString(),
                  transactionId: generateRandomString(),
                  proofPic: avatar,
                  hash: hash,
                  time: getIstTime(),
                },
              },
            }
          );
          await updateDeposite.save();
          // update wallet
          const wallet = await Wallet.findOne({ userId: user.userId });
          if (wallet) {
            const updateWallet = await Wallet.findByIdAndUpdate(
              { _id: wallet._id },
              {
                $set: {
                  history: updateDeposite._id,
                },
              }
            );
            await updateWallet.save();
          } else {
            return res.status(400).json({
              message: "Cannot find wallet",
            });
          }
          return res.status(200).json({
            message: "Deposite request successfull",
          });
        }
      } else {
        return res.status(400).json({
          message: "Minimum deposite amount is 30",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid User ID",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

// get deposite history
const depositeHistory = async (req, res) => {
  try {
    // Get the user ID from the request's authenticated user (assuming this middleware exists).
    const user_id = req.auth.id;

    if (!user_id) {
      return res.status(400).json({ message: "User id is required" });
    }

    const depositeInfo = await Deposite.findOne({ userId: user_id });

    if (!depositeInfo) {
      return res
        .status(400)
        .json({ message: "Cannot find deposite information" });
    }

    const reversedDeposits = depositeInfo.history.reverse();

    return res.status(200).json({
      user: depositeInfo.user,
      history: reversedDeposits,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Get My wallet
const getMyWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.auth.id }).lean();
    if (wallet) {
      wallet.totalBalance = wallet.investmentAmount + wallet.activeIncome;
      return res.status(200).json({ data: wallet });
    }
  } catch (error) {
    return res.status(400).json({ message: "Somethig went wrong" });
  }
};

module.exports = {
  depositeAmount,
  depositeHistory,
  getMyWallet,
};
