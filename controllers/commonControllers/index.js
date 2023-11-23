const User = require("../../models/userModel");
const SystemWallet = require("../../models/SystemInfo");
const { PDFData } = require("../../models/settingModel");
const PopupImage = require("../../models/popupImageModel");

const getSystemWallet = async (req, res) => {
  try {
    const result = await SystemWallet.findOne({ infoId: "system-info" });
    return res.status(200).json({
      url: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message.toString() });
  }
};

const getUserInfo = async (req, res) => {
  try {
    let userId = req.auth.id;
    const user = await User.findOne({ user_id: userId }).select([
      "-password",
    ]);
    if (user) {
      res.status(200).json({
        data: user,
      });
    } else {
      res.status(404).json({
        message: "Invalid user ID",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.toString(),
    });
  }
};

const getPopUpImg = async (req, res) => {
  try {
    const result = await PopupImage.findOne({ image_id: "TLCPOPUPIMAGE" });
    console.log(result)
    if (result) {
      return res.status(200).json({
        result,
      });
    } else {
      return res.status(400).json({ message: "Cannot find Image" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message.toString() });
  }
};

// Get pdf link
const getPdfLink = async (_req, res) => {
  try {
    const result = await PDFData.findOne({ pdfId: "PDFID" })
    if (result) {
      return res.status(200).json({ data: result })
    } else {
      return res.status(400).json({ message: "There is no data" })
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" })
  }
}

module.exports = {
  getSystemWallet,
  getUserInfo,
  getPopUpImg,
  getPdfLink
};
