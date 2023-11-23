const bcrypt = require("bcryptjs");
const User = require("../../models/userModel");
const Otp = require("../../models/otpModel");
const Level = require("../../models/levelModel");
const Wallet = require("../../models/walletModel");
const { generateToken, verify_jwt } = require("../../config/generateToken");
const sendOtpMail = require("../../config/sendOtpMail");
const updateLevel = require("../../config/updateLevel");
const { validationResult } = require("express-validator");
const sendForgotPasswordMail = require("../../config/sendForgotPasswordMail");
const sendMessageEmail = require("../../config/sendMessageEmail");
const getIstTime = require("../../config/getTime");
const generateUniqueUserID = require("../../config/generateUniqueUserID.js");
const AppVersion = require("../../models/AppVersion");
const sendConfirmRegistrationMail = require("../../config/sendConfrimRegisterMail");
const ValidationErrorMsg = require("../../helpers/ValidationErrorMsg");
const { STAKE_CONSTANT } = require("../../constant/staking.constant");
const { StakingPlan, StakingReward } = require("../../models/StakingModel");
const IncomeHistory = require("../../models/IncomeHistory");
const LevelIncome = require("../../models/levelIncome");
const Setting = require("../../models/Setting.model");

const getCurrentAppVersion = async (_req, res) => {
  try {
    const result = await AppVersion.find({}).sort({ createdAt: -1 });
    return res.status(200).json({
      data: result[0],
      message: "Version",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

// const calibrateLevels = async () => {

//   const allUsers = await User.find({});
//   for (const user of allUsers) {
//     // const levelUsers = await User.find({ sponsor_id: user?.user_id });
//     // const allLevels = [];
//     // for (const lvl of levelUsers) {
//     //   const data = {
//     //     user: lvl?._id,
//     //     level: "1",
//     //     user_id: lvl?.user_id,
//     //     name: lvl?.name,
//     //     mobile: lvl?.mobile,
//     //     email: lvl?.email,
//     //     sponsor_id: lvl?.sponsor_id,
//     //     joining_date: lvl?.join_date
//     //   }
//     //   allLevels.push(data)
//     // }
//     await Level.create({
//       name: user.name,
//       user_id: user.user_id,
//       email: user.email,
//       sponsor_id: user.sponsor_id,
//       level: [],
//     });
//     let currentSponsor = user;
//     for (let i = 1; i <= 12; i++) {
//       const levelUser = await Level.findOne({
//         user_id: currentSponsor?.sponsor_id,
//       });

//       if (levelUser) {
//         await updateLevel(levelUser, user, i);
//         currentSponsor = levelUser;
//       } else {
//         break;
//       }
//     }

//   }
//   console.log('finished operation')
// }

const getSetting = async (_req, res) => {
  try {
    const data = await Setting.findOne({ settingId: "hashpro-setting" });
    if (data) {
      return res.status(200).json({ data });
    } else {
      return res.status(400).json({ message: "There is no data" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const registerUser = async (req, res) => {
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
    const { name, email, password, sponsor_id, sponsor_name, mobile, otpCode } =
      req.body;

    if (
      !name ||
      !email ||
      !password ||
      !sponsor_id ||
      !sponsor_name ||
      !otpCode
    ) {
      return res.status(400).json({
        message: "All Fields are required",
      });
    }

    const otp = await Otp.findOne({ email: email });
    if (parseFloat(otp?.code) !== parseFloat(otpCode)) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      return res.status(400).json({
        message: "Email Address Already Exists",
      });
    }

    let generatedUserId;
    let isUserIdUnique = false;
    while (!isUserIdUnique) {
      generatedUserId = generateUniqueUserID();
      const isUserExists = await User.findOne({ user_id: generatedUserId });
      if (!isUserExists) {
        isUserIdUnique = true;
      }
    }

    const user = await User.create({
      name: name,
      user_id: generatedUserId,
      email: email,
      password: password,
      sponsor_id: sponsor_id,
      sponsor_name: sponsor_name,
      join_date: new Date(getIstTime().date).toDateString(),
    });

    if (!user) {
      return res.status(400).json({
        message: "User didn't created. Try Again!",
      });
    }
    await Otp.deleteOne({ email: user.email });

    // await Wallet.create({
    //   name: user.name,
    //   user_id: user.user_id,
    //   sponsor_id: user.sponsor_id,
    //   totalStakeAmount: 0,
    //   total_deposited_dollar: 0,
    //   usdtBalance: 0,
    //   busdBalance: 0,
    //   stakingRoiIncome: 0,
    //   stakingRewardIncome: 0,
    //   directIncome: 0,
    //   teamIncome: 0,
    //   allToken: 0,
    //   totalHashProToken: 1,
    //   joiningBonus: 1
    // });

    user.password = undefined;
    // Send 0.25 Hash pro token to my sponsor
    // const { date, time } = getIstTime();
    // await IncomeHistory.create({
    //   userId: req.body.user_id,
    //   fullName: req.body.name,
    //   sponsorId: req.body.sponsor_id,
    //   sponsorName: req.body.sponsorName,
    //   incomeType: "signup-token",
    //   amount: 1,
    //   date: new Date(date).toDateString(),
    //   time: time,
    // });
    // // Sponsor wallet update and histroy create
    // const sponsorParent = await User.findOne({ user_id: req.body.sponsor_id });

    // await LevelIncome.create({
    //   userId: req.body.sponsorId,
    //   fullName: req.body.sponsorname,
    //   sponsorId: sponsorParent.user_id,
    //   sponsorName: sponsorParent?.name,
    //   amountOfToken: 0.1,
    //   incomeFrom: {
    //     userId: req.body.user_id,
    //     fullName: req.body.name,
    //     email: req.body.email,
    //     level: 1,
    //     sponsorId: req.body.sponsorId,
    //   }
    // })
    // await Wallet.findOneAndUpdate(
    //   {
    //     user_id: req.body.sponsor_id,
    //   },
    //   {
    //     $inc: {
    //       directIncome: +0.1,
    //       totalHashProToken: +0.1,
    //     },
    //   },
    //   { new: true }
    // );
    // const { date, time } = getIstTime();
    // await IncomeHistory.create({
    //   user_id: user.user_id,
    //   fullName: name,
    //   sponsor_id: sponsor_id,
    //   sponsor_name: sponsor_name,
    //   incomeType: "signup-token",
    //   amount: 1,
    //   date: new Date(date).toDateString(),
    //   time: time,
    // });
    // // Sponsor wallet update and histroy create
    // const sponsorParent = await User.findOne({ user_id: sponsor_id });

    // await LevelIncome.create({
    //   userId: sponsor_id,
    //   fullName: sponsor_name,
    //   sponsorId: sponsorParent.user_id,
    //   sponsorName: sponsorParent?.name,
    //   amountOfToken: 0.1,
    //   incomeFrom: {
    //     userId: user.user_id,
    //     fullName: name,
    //     email: email,
    //     level: 1,
    //     sponsorId: sponsor_id,
    //     stackingAmount: 1
    //   },
    //   incomeType: "Direct reward",
    //   date: new Date(date).toDateString(),
    //   time: time,

    // })
    // await Wallet.findOneAndUpdate(
    //   {
    //     user_id: sponsor_id,
    //   },
    //   {
    //     $inc: {
    //       directIncome: +0.1,
    //       totalHashProToken: +0.1,
    //     },
    //   },
    //   { new: true }
    // );

    // await Level.create({
    //   name: user.name,
    //   user_id: user.user_id,
    //   email: user.email,
    //   sponsor_id: user.sponsor_id,
    //   level: [],
    // });

    // let currentSponsor = user;
    // for (let i = 1; i <= 12; i++) {
    //   const levelUser = await Level.findOne({
    //     user_id: currentSponsor?.sponsor_id,
    //   });

    //   if (levelUser) {
    //     await updateLevel(levelUser, user, i);
    //     currentSponsor = levelUser;
    //   } else {
    //     break;
    //   }
    // }

    // sendConfirmRegistrationMail(user, user.user_id);

    return res.status(201).json({
      data: user,
      message: "Registration Successful",
    });
  } catch (error) {
    console.log("Hello", error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

const authUser = async (req, res) => {
  try {
    const { email, user_id, password } = req.body;

    if ((!email && user_id) || !password) {
      return res.status(400).json({
        message: "Credential Missing!",
      });
    }

    const user = await User.findOne({
      $or: [{ user_id: user_id }, { email: email }],
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        message: "Invalid username or password",
      });
    }
    if (!user?.user_status) {
      return res.status(400).json({ message: "You are a blocked user" });
    }
    user.password = undefined;

    // if (user.role === "admin") {
    //   return res.status(200).json({
    //     message: "Login successful",
    //     token: await generateToken(user_id),
    //     user,
    //   });
    // }
    // if (joiningBonus?.joiningBonus == 1) {
    //   // ==========
    //   console.log(joiningBonus?.joiningBonus);
    //   const error = validationResult(req).formatWith(ValidationErrorMsg);
    //   if (!error.isEmpty()) {
    //     let msg;
    //     Object.keys(req.body).map((d) => {
    //       if (error.mapped()[d] !== undefined) {
    //         msg = error.mapped()[d];
    //       }
    //     });
    //     if (msg !== undefined) {
    //       return res.status(400).json({
    //         message: msg,
    //       });
    //     }
    //   }

    //   try {
    //     const duration = 36,
    //       amount = joiningBonus?.joiningBonus;

    //     // find wallet
    //     await Wallet.findOneAndUpdate(
    //       { user_id },
    //       {
    //         $inc: {
    //           totalHashProToken: -Number(amount),
    //           totalStakeAmount: +Number(amount),
    //         },
    //       }
    //     );
    //     // calculate return date:---------
    //     const currentDate =
    //       duration === STAKE_CONSTANT.twelve.duration
    //         ? 12
    //         : duration === STAKE_CONSTANT.twentyFour.duration
    //         ? 24
    //         : 36;
    //     const returnD = new Date(getIstTime().date);
    //     returnD.setMonth(returnD.getMonth() + currentDate);
    //     // Calculate return amount
    //     const returnM =
    //       duration === STAKE_CONSTANT.twelve.duration
    //         ? (Number(amount) / 100) * STAKE_CONSTANT.twelve.percentage +
    //           Number(amount)
    //         : duration === STAKE_CONSTANT.twentyFour.duration
    //         ? (Number(amount) / 100) * STAKE_CONSTANT.twentyFour.percentage +
    //           Number(amount)
    //         : (Number(amount) / 100) * STAKE_CONSTANT.thirtySix.percentage +
    //           Number(amount);
    //     console.log("returnM", returnM, "amount", amount);
    //     // Create stake
    //     const user = await User.findOne({ user_id });
    //     const stakeCreate = await StakingPlan.create({
    //       userId: user_id,
    //       fullName: user?.name,
    //       sponsorId: user?.sponsor_id,
    //       sponsorName: user?.sponsor_name,
    //       stakeAmount: amount,
    //       stakeDate: {
    //         mileSecond: new Date(getIstTime().date).getTime(),
    //         formattedDate: new Date(getIstTime().date).toDateString(),
    //       },
    //       stakeDuration: duration,
    //       returnDate: {
    //         mileSecond: returnD.getTime(),
    //         formattedDate: returnD.toDateString(),
    //       },
    //       returnAmount: returnM,
    //       type: "joining bonus",
    //     });

    //     // joining Bounus Decriment
    //     await Wallet.findOneAndUpdate(
    //       { user_id },
    //       { $inc: { joiningBonus: -1 } },
    //       { new: true }
    //     );
    //     console.log("Stack Create for 36 Months");
    //     // if (stakeCreate) {
    //     //   return res.status(201).json({ message: "Staking successfully" });
    //     // }
    //   } catch (error) {
    //     console.log(error);
    //     return res.status(500).json({ message: "Something went wrong" });
    //   }
    // }
    // console.log(user.user_id);
    return res.status(200).json({
      message: "Login successful",
      token: await generateToken(user.user_id),
      user,
    });
  } catch (error) {
    console.log("444", error.message);
    return res.status(400).json({
      message: "Something went wrong1!",
      error: error,
    });
  }
};

const getSponsorName = async (req, res) => {
  const userId = req.params.user_id;

  const user = await User.findOne({ user_id: userId });

  if (user) {
    return res.status(200).json({
      name: user.name,
    });
  } else {
    return res.status(400).json({
      message: "Invalid user ID",
    });
  }
};

const sendOtp = async (req, res) => {
  const {
    email, // this for register, change password, change trx password
    user_id, // this for login
    password, // this for login
    sponsor_id, //for register
    new_email,
    mobile,
    current_password,
    current_trx_password,
    trx_address,
    trx_password,
  } = req.body;
  const Otpcode = Math.floor(1000 + Math.random() * 9000); // Generate OTP code
  const expireTime = new Date().getTime() + 300 * 1000; // create expire time

  try {
    // withdraw
    if (user_id && trx_address) {
      const user = await User.findOne({ user_id: user_id });

      if (user) {
        if (
          user?.busdWallet === trx_address ||
          user?.hptWallet === trx_address ||
          user?.usdtWallet === trx_address
        ) {
          if (user.email) {
            const existingOtp = Otp.findOne({ email: user.email });
            if (existingOtp) {
              await Otp.deleteOne({ email: user.email });
            }
            // Save otp on database
            const newOtp = await Otp.create({
              email: user.email,
              user_id: user.userId,
              code: Otpcode,
              expireIn: expireTime,
            });

            if (newOtp) {
              sendOtpMail(newOtp.email, newOtp.code);
              return res.status(200).json({
                message: "OTP sent on your email",
              });
            } else {
              return res.status(400).json({
                message: "Can not send OTP",
              });
            }
          }
        } else {
          return res.status(400).json({
            message: "Invalid a trx address",
          });
        }
      } else {
        return res.status(400).json({
          message: "Invalid user credential",
        });
      }
    }
    // for register user
    if (email && password) {
      try {
        const existingOtp = Otp.findOne({ email: email });
        if (existingOtp) {
          await Otp.deleteOne({ email: email });
        }
        // // Sponsorid id checked
        // const sponsorID = await User.findOne({ user_id: sponsor_id });
        // if (!sponsorID) {
        //   return res.status(400).json({
        //     message: "Please Provide Valid Sponsor Id",
        //   });
        // }
        // Email id check
        const findEmail = await User.findOne({ email: email });
        if (findEmail) {
          return res.status(400).json({ message: "Email alrealy exist" });
        }
        // Save otp on database
        const newOtp = await Otp.create({
          email: email,
          code: Otpcode,
          expireIn: expireTime,
        });

        if (newOtp) {
          console.log(newOtp);
          sendOtpMail(newOtp.email, newOtp.code);
          return res.status(200).json({
            message: "OTP sent on your email",
          });
        } else {
          return res.status(400).json({
            message: "Can not send OTP",
          });
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          message: "Somthing want Wrong!",
        });
      }
    }
    // for change password
    if (user_id && current_password) {
      // console.log("userid", user_id)
      const user = await User.findOne({ user_id: user_id });
      if (user && (await user.matchPassword(current_password))) {
        const existingOtp = Otp.findOne({ email: user.email });
        if (existingOtp) {
          await Otp.deleteOne({ email: user.email });
        }
        // Save otp on database
        const newOtp = await Otp.create({
          email: user.email,
          code: Otpcode,
          expireIn: expireTime,
        });

        if (newOtp) {
          sendOtpMail(newOtp.email, newOtp.code);
          return res.status(200).json({
            message: "OTP sent on your email",
          });
        } else {
          return res.status(400).json({
            message: "Can not send OTP",
          });
        }
      } else {
        return res.status(400).json({
          message: "Incorrect current password",
        });
      }
    }
    // forgot password
    if (email && current_password) {
      const user = await User.findOne({ email: email });
      if (user) {
        const existingOtp = Otp.findOne({ email: user.email });
        if (existingOtp) {
          await Otp.deleteOne({ email: user.email });
        }
        // Save otp on database
        const newOtp = await Otp.create({
          email: user.email,
          code: Otpcode,
          expireIn: expireTime,
        });

        if (newOtp) {
          sendOtpMail(newOtp.email, newOtp.code);
          return res.status(200).json({
            message: "OTP sent on your email",
          });
        } else {
          return res.status(400).json({
            message: "Can not send OTP",
          });
        }
      } else {
        return res.status(400).json({
          message: "Email doesn't exist",
        });
      }
    }
    // for change transaction password
    if (user_id && current_trx_password) {
      const existTrxPassword = await User.findOne({
        trxPassword: current_trx_password,
      });
      if (existTrxPassword) {
        const existingOtp = Otp.findOne(existTrxPassword.email);
        if (existingOtp) {
          await Otp.deleteOne({ email: existTrxPassword.email });
        }
        // Save otp on database
        const newOtp = await Otp.create({
          email: existTrxPassword.email,
          code: Otpcode,
          expireIn: expireTime,
        });
        console.log(newOtp.code);
        if (newOtp) {
          sendOtpMail(newOtp.email, newOtp.code);
          return res.status(200).json({
            message: "OTP sent on your email",
          });
        } else {
          return res.status(400).json({
            message: "Can not send OTP",
          });
        }
      } else {
        return res.status(400).json({
          message: "Incorrect current trx password",
        });
      }
    }
    // for change email
    if (user_id && new_email) {
      const user = await User.findOne({ user_id: user_id });
      const existEmail = await User.findOne({ email: user.email });
      // const existNewEmail = await User.findOne({ email: new_email });
      if (existEmail) {
        const existingOtp = Otp.findOne({ email: existEmail.email });
        if (existingOtp) {
          await Otp.deleteOne({ email: existEmail.email });
        }
        // Save otp on database
        const newOtp = await Otp.create({
          email: new_email,
          code: Otpcode,
          expireIn: expireTime,
        });

        if (newOtp) {
          sendOtpMail(newOtp.email, newOtp.code);
          return res.status(200).json({
            message: "OTP sent on your email",
          });
        } else {
          return res.status(400).json({
            message: "Can not send OTP",
          });
        }
      } else {
        return res.status(400).json({
          message: "Incorrect current email",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Something went wrong!",
    });
  }
};

// Send Forgot password link Mail
const ForgotPassword = async (req, res) => {
  try {
    const { user_id } = req.body;
    // console.log(user_id)
    if (!user_id) {
      return res.status(400).json({
        message: "Please Put user id",
      });
    } else {
      const user = await User.findOne({
        $or: [{ user_id: user_id }, { email: user_id }],
      });
      if (user) {
        let newToken = await generateToken(user.user_id);
        const updateUser = await User.findOneAndUpdate(
          { user_id: user.user_id },
          {
            $set: {
              token: newToken,
            },
          },
          { new: true }
        );
        if (updateUser) {
          sendForgotPasswordMail(user.email, newToken);
          return res.status(200).json({
            message: "Forgot password email sent successfully",
          });
        } else {
          return res.status(400).json({
            message: "Something wrong",
          });
        }
      } else {
        return res.status(400).json({
          message: "User doesn't exist",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};
// Send Forgot password link Mail
const ForgotPasswordForApplication = async (req, res) => {
  try {
    const { new_password, confirm_password, otpCode, user_id } = req.body;
    if (!new_password) {
      return res.status(400).json({ message: "New password is required" });
    }
    if (!confirm_password) {
      return res.status(400).json({ message: "Confirm password is required" });
    }
    if (!otpCode) {
      return res.status(400).json({ message: "Otp is required" });
    }
    if (!user_id) {
      return res.status(400).json({
        message: "Please Put user id",
      });
    } else if (new_password !== confirm_password) {
      return res.status(400).json({ message: "Password do not match" });
    } else {
      const user = await User.findOne({
        $or: [{ user_id: user_id }, { email: user_id }],
      });
      if (user) {
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
        return res.status(400).json({
          message: "User doesn't exist",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// reset Password
const resetPassword = async (req, res) => {
  try {
    const tokenId = req.params.token;
    // console.log(tokenId)
    let decoded = verify_jwt(tokenId);
    if (decoded.status) {
      // console.log(decoded.data)
      var userId = decoded?.data?.id;
    } else {
      res.status(401).send({
        error: {
          message: "Unauthorized access",
        },
      });
    }
    const { password } = req.body;
    if (tokenId) {
      const user = await User.findOne({ user_id: userId });

      if (user) {
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
        const update_password = await User.updateOne(
          { _id: user._id },
          {
            $set: {
              password: encryptedPassword,
            },
          }
        );
        if (update_password) {
          return res.status(200).json({
            message: "Password Updated",
          });
        }
      } else {
        return res.status(400).json({
          message: "User doesn't exist",
        });
      }
    } else {
      return res.status(400).json({
        message: "Token missing or invalid",
      });
    }
  } catch (error) {
    //console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// check mobile number
const checkMobileNumber = async (req, res) => {
  try {
    const mobile = req.params.mobile;
    if (!mobile) {
      return res.status(400).json({
        message: "Please fill mobile number field",
      });
    } else {
      const user = await User.findOne({ mobile: mobile });
      if (user) {
        return res.status(400).json({
          message: "Mobile number taken",
        });
      } else {
        return res.status(200).json({
          message: "Mobile number available",
        });
      }
    }
  } catch (error) {
    //console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// check email number
const checkEmail = async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) {
      return res.status(400).json({
        message: "Please fill email field",
      });
    } else {
      const user = await User.findOne({ email: email });
      if (user) {
        return res.status(400).json({
          message: "Email taken",
        });
      } else {
        return res.status(200).json({
          message: "Available email",
        });
      }
    }
  } catch (error) {
    //console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// check email number
const checkSponsorId = async (req, res) => {
  try {
    const sponsor_id = req.params.sponsor_id;
    if (!sponsor_id) {
      return res.status(400).json({
        message: "Please fill sponsor id field",
      });
    } else {
      const user = await User.findOne({
        user_id: sponsor_id,
      });

      if (user) {
        return res.status(200).json({
          sponsor_name: user.name,
          message: "Valid sponsor id",
        });
      } else {
        return res.status(400).json({
          message: "Invalid sponsor id",
        });
      }
    }
  } catch (error) {
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { name, user_id, email, message, subject, mobile } = req.body;
    if (!name) {
      return res.status(400).json({
        message: "Name is missing",
      });
    }
    if (!user_id) {
      return res.status(400).json({
        message: "User ID is missing",
      });
    }
    if (!email) {
      return res.status(400).json({
        message: "Email is missing",
      });
    }
    if (!message) {
      return res.status(400).json({
        message: "Message is missing",
      });
    }
    if (!subject) {
      return res.status(400).json({
        message: "Subject is missing",
      });
    }
    if (!mobile) {
      return res.status(400).json({
        message: "Mobile is missing",
      });
    }
    if (name && user_id && email && message && subject && mobile) {
      sendMessageEmail(name, user_id, email, message, subject, mobile);
      return res.status(200).json({
        message: "Message sent successfully",
      });
    } else {
      return res.status(400).json({
        message: "Cannot send message",
      });
    }
  } catch (error) {
    //console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

module.exports = {
  getCurrentAppVersion,
  getSetting,
  registerUser,
  authUser,
  sendOtp,
  getSponsorName,
  ForgotPassword,
  ForgotPasswordForApplication,
  resetPassword,
  checkMobileNumber,
  checkEmail,
  checkSponsorId,
  sendMessage,
  // calibrateLevels
};
