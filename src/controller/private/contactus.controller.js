const Contact = require("../../models/contactus.model");

const getAllContactUsHistory = async (_req, res) => {
  try {
    const allContactUs = await Contact.find({}).sort({
      "history.date": -1,
      "history.time": -1,
    });
    if (allContactUs.length > 0) {
      return res.status(200).json(allContactUs);
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

module.exports = getAllContactUsHistory;
