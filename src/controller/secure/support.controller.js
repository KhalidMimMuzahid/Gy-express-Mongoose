const cloudinary = require("../../config/cloudinary");
const getIstTime = require("../../config/getTime");
const User = require("../../models/auth.model");
const SupportTicket = require("../../models/supportTicket.model");
const Update = require("../../models/updates.model");

// get updates
const getUpdates = async (req, res) => {
  try {
    const userId = req.auth;
    if (userId) {
      const updates = await Update.find({}).sort({ date: -1 });
      if (updates) {
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
    const { purpose, previous_ticket_reff, question } = req.body;
    const user_id = req.auth;

    if (!req.body)
      return res.status(400).json({
        message: "Please provide data",
      });
    if (!req.file?.path)
      return res.status(400).json({
        message: "Image is missing",
      });
    if (!user_id)
      return res.status(400).json({
        message: "User Id is missing",
      });
    if (!purpose)
      return res.status(400).json({
        message: "Purpose is missing",
      });
    if (!previous_ticket_reff)
      return res.status(400).json({
        message: "Previous reference is missing",
      });
    if (!question)
      return res.status(400).json({
        message: "Question is missing",
      });

    // find user
    const user = await User.findOne({ userId: user_id });

    // upload the image
    const image = await cloudinary.uploader.upload(req.file?.path);
    const avatar = {
      avatar: image.secure_url,
      avatar_public_url: image.public_id,
    };

    if (user) {
      // already have support tckect collection or not
      const existingSupport = await SupportTicket.findOne({ userId: user_id });
      if (!existingSupport) {
        const newSupportTicket = await SupportTicket.create({
          userId: user.userId,
          user_name: user.fullName,
          history: [
            {
              userId: user.userId,
              email: user.email,
              mobile: user.mobile,
              purpose: purpose,
              previous_ticket_reff: previous_ticket_reff,
              image: avatar,
              question: question,
              date: new Date().toDateString(),
              time: getIstTime(),
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
                userId: user.userId,
                email: user.email,
                mobile: user.mobile,
                purpose: purpose,
                previous_ticket_reff: previous_ticket_reff,
                image: avatar,
                question: question,
                date: new Date().toDateString(),
                time: getIstTime(),
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
    const userId = req.auth;
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

module.exports = { getUpdates, createSupportTicket, getSupportHistory };
