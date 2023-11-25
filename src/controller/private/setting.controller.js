const User = require("../../models/auth.model");
const Otp = require("../../models/otp.model");
const bcrypt = require("bcryptjs");
const PDFData = require("../../models/setting.model");
const { Result } = require("express-validator");

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password, otpCode } = req.body;
    const user_id = req.auth.id;
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
      const user = await User.findOne({ userId: req.auth.id });
      // check already have anaccount with this email or not
      const existingUser = await User.findOne({ email: new_email });
      // check OTP
      const otp = await Otp.findOne({ email: new_email });
      if (otp?.code === otpCode) {
        if (!existingUser && user && user.email === currentEmail) {
          let updateEmail = await User.findOneAndUpdate(
            { userId: req.auth.id },
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

module.exports = { changePassword, updateEmail, changePdfLink };
