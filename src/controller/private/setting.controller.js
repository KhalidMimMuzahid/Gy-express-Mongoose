const User = require("../../models/auth.model");
const Otp = require("../../models/otp.model");
const bcrypt = require("bcryptjs");
const PDFData = require("../../models/setting.model");
const { Result } = require("express-validator");
const WinningSharePercentage = require("../../models/levelCommissionPerCentageForWinningShare");
const { RoiSetting } = require("../../models/roiSetting.model");
const ManageAmount = require("../../models/manageAmount.model");
const GameWalletPercentage = require("../../models/gameWalletPercentage");

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password, otpCode } = req.body;
    const user_id = req.auth;
    if (!new_password) {
      return res.status(400).json({
        message: "New password is missing",
      });
    }
    if (!current_password) {
      return res.status(400).json({
        message: "Current password is missing",
      });
    }
    if (!otpCode) {
      return res.status(400).json({
        message: "OTP is missing",
      });
    }
    // find user
    const user = await User.findOne({ userId: user_id });
    if (user && (await user.matchPassword(current_password))) {
      // check OTP
      const otp = await Otp.findOne({ email: user.email });
      if (otp && parseInt(otp?.code) === parseInt(otpCode)) {
        const salt = bcrypt.genSaltSync(10);
        const encryptedPassword = bcrypt.hashSync(new_password, salt);
        await User.findOneAndUpdate(
          { userId: user_id },
          {
            $set: {
              password: encryptedPassword,
            },
          },
          { new: true }
        );
        return res.status(200).json({
          message: "Password change successfully",
        });
      } else {
        return res.status(400).json({
          message: "Invalid OTP",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid Current Password",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};
// Chagne email
const updateEmail = async (req, res) => {
  try {
    if (!req.body.currentEmail) {
      return res.status(400).json({
        message: "Field is required!",
      });
    } else {
      const { currentEmail, new_email, otpCode } = req.body;
      const user = await User.findOne({ userId: req.auth });
      // check already have anaccount with this email or not
      const existingUser = await User.findOne({ email: new_email });
      // check OTP
      const otp = await Otp.findOne({ email: new_email });
      if (otp?.code === otpCode) {
        if (!existingUser && user && user.email === currentEmail) {
          let updateEmail = await User.findOneAndUpdate(
            { userId: req.auth },
            {
              $set: {
                email: new_email,
              },
            },
            { new: true }
          );
          if (updateEmail) {
            return res.status(200).json({
              message: "Email changed Successfully",
            });
          }
        } else {
          return res.status(400).json({
            message: "Invalid user ID or email",
          });
        }
      } else {
        return res.status(400).json({
          message: "Invalid OTP",
        });
      }
    }
  } catch (e) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};
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

// api from client-side    http://localhost:2023/api/v1/private/winning-share-percentage
const getWinningSharePercentage = async (req, res) => {
  try {
    const winningSharePercentage = await WinningSharePercentage.findOne({});

    return res.status(200).json({ data: winningSharePercentage });
  } catch (error) {
    return res.status(400).json({ message: "Somethig went wrong" });
  }
};
//this api  is for updating winning share percentage by admin
const updateWinningSharePercentage = async (req, res) => {
  try {
    const winningSharePercentageData = req?.body;
    const winningSharePercentage =
      await WinningSharePercentage.findOneAndUpdate(
        {},
        winningSharePercentageData,
        { new: true, upsert: true }
      );
    return res.status(200).json({
      data: winningSharePercentage,
      message: "Data updated successfully",
    });
  } catch (error) {
    return res.status(400).json({ message: "Somethig went wrong" });
  }
};

const updateGameWalletPercentage = async (req, res) => {
  try {
    const gameWalletPercentageData = req?.body;
    const gameWalletPercentage = await GameWalletPercentage.findOneAndUpdate(
      {},
      gameWalletPercentageData,
      { new: true, upsert: true }
    );
    // console.log({ gameWalletPercentage });

    return res.status(200).json({
      data: gameWalletPercentage,
      message: "Data updated successfully",
    });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
const getGameWalletPercentage = async (req, res) => {
  try {
    const gameWalletPercentage = await WinningSharePercentage.findOne({});

    return res.status(200).json({ data: gameWalletPercentage });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
// Update ROI Percentage
const updateRoiPercentage = async (req, res) => {
  try {
    const { roiPercentage } = req.body;
    if (!roiPercentage) {
      return res.status(400).json({ message: "ROI Percentage is required" });
    }
    const updatedData = await RoiSetting.findOneAndUpdate(
      {},
      { roiPercentage: roiPercentage },
      { new: true, upsert: true }
    );
    if (updatedData) {
      return res.status(200).json({ message: "ROI Percentage is updated" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Get ROI percentage
const getRoiPercentage = async (_req, res) => {
  try {
    const roiPercentageData = await RoiSetting.findOne({});

    if (roiPercentageData) {
      return res.status(200).json({ data: roiPercentageData });
    } else {
      return res.status(400).json({ message: "There is no data" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Somethig went wrong" });
  }
};

const manageAmount = async (req, res) => {
  try {
    const { minimumDepositAmount, minimumWithdrawAmount, withdrawPercentage } =
      req.body;

    if (minimumDepositAmount) {
      const manageAmount = await ManageAmount.findOneAndUpdate(
        { Id: "MANAGEAMOUNTID" },
        { $set: { minimumDepositAmount: minimumDepositAmount } },
        { new: true, upsert: true }
      );

      res.json({
        message: `Minimum deposit set to ${manageAmount.minimumDepositAmount} Rs.`,
      });
    } else if (minimumWithdrawAmount) {
      const manageAmount = await ManageAmount.findOneAndUpdate(
        { Id: "MANAGEAMOUNTID" },
        { $set: { minimumWithdrawAmount: minimumWithdrawAmount } },
        { new: true, upsert: true }
      );

      res.json({
        message: `Minimum Withdraw set to ${manageAmount.minimumWithdrawAmount} Rs.`,
      });
    } else if (withdrawPercentage) {
      const manageAmount = await ManageAmount.findOneAndUpdate(
        { Id: "MANAGEAMOUNTID" },
        { $set: { withdrawPercentage: withdrawPercentage } },
        { new: true, upsert: true }
      );

      res.json({
        message: `Minimum Withdraw Percentage set to ${manageAmount.withdrawPercentage} Rs.`,
      });
    } else {
      res.status(400).json({
        message: "Data is missing",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Somethig went wrong" });
  }
};

const setMinimumDepositAmount = async (req, res) => {
  try {
    const { minimumDepositeAmount } = req.body;
    if (minimumDepositeAmount) {
      const manageAmount = await ManageAmount.findOneAndUpdate(
        { Id: "MANAGEAMOUNTID" },
        { $set: { minimumDepositAmount: minimumDepositeAmount } },
        { new: true, upsert: true }
      );

      return res.json({
        message: `Minimum deposit set to ${manageAmount.minimumDepositAmount} Rs.`,
      });
    } else {
      return res
        .status(400)
        .json({ error: "Minimum deposit amount is required." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const setMinimumWithdrawAmount = async (req, res) => {
  try {
    const { minimumWithdrawAmount } = req.body;

    if (!minimumWithdrawAmount) {
      return res
        .status(400)
        .json({ error: "Minimum Withdraw Amount is required." });
    }

    const manageAmount = await ManageAmount.findOneAndUpdate(
      { Id: "MANAGEAMOUNTID" },
      { $set: { minimumWithdrawAmount: minimumWithdrawAmount } },
      { new: true, upsert: true }
    );

    res.json({
      message: `Minimum Withdraw set to ${manageAmount.minimumWithdrawAmount} Rs.`,
    });
  } catch (error) {
    console.error("Error in setMinimumWithdrawAmount controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const setWithdrawPercentage = async (req, res) => {
  try {
    const { withdrawPercentage } = req.body;

    if (!withdrawPercentage) {
      return res
        .status(400)
        .json({ error: "Withdraw Percentage is required." });
    }

    const manageAmount = await ManageAmount.findOneAndUpdate(
      { Id: "MANAGEAMOUNTID" },
      { $set: { withdrawPercentage: withdrawPercentage } },
      { new: true, upsert: true }
    );

    res.json({
      message: `Withdraw Percentage set to ${manageAmount.withdrawPercentage}%.`,
    });
  } catch (error) {
    console.error("Error in setWithdrawPercentage controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getManageAmount = async (req, res) => {
  try {
    const manageAmount = await ManageAmount.find();
    if (manageAmount) {
      return res.status(200).json({ message: manageAmount });
    } else {
      return res.status(400).json({ message: "Data Not Found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Somethig went wrong" });
  }
};
module.exports = {
  changePassword,
  updateEmail,
  changePdfLink,
  getWinningSharePercentage,
  updateWinningSharePercentage,
  getGameWalletPercentage,
  updateGameWalletPercentage,
  updateRoiPercentage,
  getRoiPercentage,
  setMinimumDepositAmount,
  setMinimumWithdrawAmount,
  setWithdrawPercentage,
  getManageAmount,
};
