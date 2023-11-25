const { cloudinary } = require("../../config/cloudinary");
const Kyc  = require("../../models/KYCSchema");
const Bank = require("../../models/addBank.model");
const User = require("../../models/auth.model");
const Otp = require("../../models/otp.model");
const Wallet = require("../../models/wallet.model");
const bcrypt = require("bcryptjs");

// Get user Information
const getUserInfo = async (req, res) => {
  try {
    let userId = req.auth.id;
    const user = await User.findOne({ userId: userId }).select(["-password"]);
    if (user) {
      return res.status(200).json({
        data: user,
      });
    } else {
      return res.status(404).json({
        message: "Invalid user ID",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// Update user Information
const updateUserInfo = async (req, res) => {
  try {
    const data = req.body;
    const updatedUser = await User.updateOne({ userId: data.userId }, data);
    if (updatedUser) {
      return res.status(200).json({
        message: "User information updated",
      });
    } else {
      return res.status(400).json({
        message: "Cannot update user information",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

// change password
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
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// update email
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

// update TRX wallet address
const updateTrxAddress = async (req, res) => {
  try {
    const { trx_address } = req.body;
    if (!trx_address) {
      return res.status(400).json({ message: "TRX address is missing" });
    }
    const extUser = await User.findOne({ userId: req.auth.id });
    // find User
    const user = await User.findOneAndUpdate(
      { userId: req.auth.id },
      {
        $set: {
          walletAddress: trx_address,
        },
      }
    );
    // find wallet
    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.auth.id },
      {
        $set: {
          walletAddress: trx_address,
        },
      }
    );
    if (wallet && user) {
      return res
        .status(200)
        .json({ message: "TRX address changed successfully" });
    } else {
      return res.status(400).json({ message: "Cannot change TRX address" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// upload user profile picture
const upLoadProofPic = async (req, res) => {
  try {
    // const user_id = req.auth.id;
    const image = await cloudinary.uploader.upload(req.file.path);
    const avatar = {
      avatar: image.secure_url,
      avatar_public_url: image.public_id,
    };
    return res.status(200).json({ avatar });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// update user profile picture
const updateProfilePic = async (req, res) => {
  try {
    const user_id = req.auth.id;
    if (!req.file?.path)
      res.status(400).json({
        message: "Image is missing",
      });
    const findUser = await User.findOne({ userId: user_id });
    if (findUser.avatar_public_url) {
      await cloudinary.uploader.destroy(findUser.avatar_public_url);
    }
    const image = await cloudinary.uploader.upload(req.file.path);
    const avatar = {
      avatar: image.secure_url,
      avatar_public_url: image.public_id,
    };
    await User.findOneAndUpdate(
      { user_id: user_id },
      {
        $set: {
          avatar: avatar.avatar,
          avatar_public_url: avatar.avatar_public_url,
        },
      }
    );

    return res.status(200).json({ message: "Image uploaded" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
const addOrUpdateBank = async (req, res) => {
  try {
    const user_id = req.auth.id;
    const { bankName, holderName, branchName, accountNumber, IFSCCode } = req.body;

    // Validate the data (you can add more validation as needed)
    if (!bankName || !holderName || !branchName || !accountNumber || !IFSCCode) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Check if a bank already exists for the user
    const existingBank = await Bank.findOne({ userId: user_id });

    if (existingBank) {
      // Update the existing bank's information
      existingBank.bankName = bankName;
      existingBank.holderName = holderName;
      existingBank.branchName = branchName;
      existingBank.accountNumber = accountNumber;
      existingBank.IFSCCode = IFSCCode;

      await existingBank.save();

      res.status(200).json({ message: 'Bank updated successfully', bank: existingBank });
    } else {
      // Create a new bank object
      const newBank = new Bank({
        userId: user_id,
        bankName,
        holderName,
        branchName,
        accountNumber,
        IFSCCode,
      });

      // Save the bank to the database
      await newBank.save();

      res.status(201).json({ message: 'New bank created successfully', bank: newBank });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating/adding the bank.' });
  }
};

const getBank = async(req, res)=>{
  try {
  
    // Extract the user ID from the request parameters
    const user_id = req.auth.id;

    // Find banks that belong to the specified user
    const banks = await Bank.find({ userId: user_id });

    // Check if any banks are found
    if (!banks || banks.length === 0) {
      return res.status(404).json({ message: 'No banks found for the user ID' });
    }

    res.status(200).json({ message: 'Banks retrieved successfully', banks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching banks by user ID.' });
  }
}

const createKycApi = async (req, res) => {
  const sendResponse = (res, success, message, data) => {
    return res.json({
      success,
      message,
      data,
    });
  };
  
  try {
    // Get the request body
    const kycData = req.body;

console.log(req.auth.id)
    // Check if the user already has a KYC in "success" or "pending" status
    const existingKyc = await Kyc.findOne({
      userId: req.auth.id,
      status: { $in: ["success", "pending"] },
    });

    if (!existingKyc) {
      // Set the user ID and create the KYC document
      kycData.userId = req.auth.id;
      console.log({kycData})
      const createdKyc = await Kyc.create(kycData);

      if (createdKyc) {
        // Return a success response
        return sendResponse(res, true, 'KYC created successfully', createdKyc);
      } else {
        // Handle the case where KYC creation failed
        return sendResponse(res, false, 'KYC creation failed', null);
      }
    } else {
      // Handle the case where the user already has a KYC
      return sendResponse(res, false, 'User already has a KYC in progress or completed', null);
    }
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    return sendResponse(res, false, 'Something went wrong', null);
  }
};


const getKycApi = async (req, res) => {
  
  
  try {
    // Find KYC documents for the user with the provided user ID
    const userKyc = await Kyc.find({ userId: req.auth.id });

    if (userKyc && userKyc.length > 0) {
      // Return a success response with the KYC documents
      res.status(200).json({message:"KYC Document Found", data:userKyc})

    } else {
      // Handle the case where no KYC documents are found
      res.status(500).json({ message: 'SNo KYC documents found for the user' });
    }
  } catch (error) {
    // Handle unexpected errors and provide an informative error message
    console.error(error);
    res.status(500).json({ message: 'Something went wrong while fetching KYC documents' });
  }
};

const getKycSuccess= async (req, res) => {
  try {
    const userKyc = await Kyc.find({ userId: req.auth.id ,status: "success"});

    if (userKyc && userKyc.length > 0) {
      res.status(200).json({message:"KYC Document Found", data:userKyc})

    } else {
      res.status(500).json({ message: 'SNo KYC documents found for the user' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong while fetching KYC documents' });
  }
};
module.exports = {
  getUserInfo,
  updateUserInfo,
  changePassword,
  updateEmail,
  updateTrxAddress,
  updateProfilePic,
  upLoadProofPic,
  addOrUpdateBank,
  getBank,
  createKycApi,
  getKycApi,
  getKycApi,
  getKycSuccess,
};
