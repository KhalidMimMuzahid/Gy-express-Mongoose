const { validationResult } = require("express-validator");
const { generateToken, verify_jwt } = require("../../config/generateToken");
const generateUniqueUserID = require("../../config/generateUniqueUserID");
const sendConfrimRegistrationMail = require("../../config/sendConfrimRegisterMail");
const sendOtpMail = require("../../config/sendOtpMail");
const User = require("../../models/auth.model");
const Level = require("../../models/level.model");
const Otp = require("../../models/otp.model");
const Wallet = require("../../models/wallet.model");
const ValidationErrorMsg = require("../../helpers/ValidationErrorMsg");
const updateLevel = require("../../utils/updateLavel");
const getIstTime = require("../../config/getTime");
const generateRandomString = require("../../config/generateRandomId");
const bcrypt = require("bcryptjs");
const PDFData = require("../../models/setting.model");
const sendForgotPasswordMail = require("../../config/sendForgotPasswordMail");
const generateUniqueIdByDate = require("../../config/generateUniqueIdByDate");
const generateRandomPassword = require("../../config/generateRandomPassword");
const { OAuth2Client } = require("google-auth-library");
const ProidId = require("../../models/periodId.model");
const PeriodRecord = require("../../models/periodRecord");
const secretToken =
  "350224658302-etk8h8jcju1qbrjri8nrkd0uamgs7a62.apps.googleusercontent.com";
const clientSecret = "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";
const client = new OAuth2Client(secretToken);

const registerController = async (req, res) => {
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
    const {
      fullName,
      email,
      password,
      confirmPassword,
      mobile,
      sponsorId,
      sponsorName,
      otpCode,
      role,
    } = req.body;
    if (!fullName || !email || !password || !role || !confirmPassword) {
      return res.status(400).json({ message: "Please Enter all the Feilds" });
    } else if (!password === confirmPassword) {
      return res.status(400).json({ message: "Password dosen't match" });
    }
    let generatedUserId;
    let isUserIdUnique = false;

    while (!isUserIdUnique) {
      generatedUserId = generateUniqueUserID();
      const isUserExists = await User.findOne({ userId: generatedUserId });
      if (!isUserExists) {
        isUserIdUnique = true;
      }
    }
    const userExists = await User.findOne({ email: email });
    const otp = await Otp.findOne({ email: email });
    const sponsorname = await User.findOne({
      userId: sponsorId?.toUpperCase(),
    });

    if (!userExists) {
      if (otpCode && parseInt(otp?.code) === parseInt(otpCode)) {
        const user = await User.create({
          fullName: fullName,
          userId: generatedUserId,
          email: email,
          password: password,
          mobile: mobile,
          sponsorId: sponsorId?.toUpperCase() || "ADMIN",
          sponsorName: sponsorName || "Admin",
          token: generateToken(email),
          userStatus: true,
          isActive: false,
          joiningDate: new Date(getIstTime().date).toDateString(),
        });
        if (user) {
          // delete Otp
          if (otpCode) {
            await Otp.deleteOne({ email: user.email });
          }

          // create wallet
          await Wallet.create({
            userId: user.userId,
            fullName: user.fullName,
            sponsorId: user.sponsorId,
            sponsorName: user.sponsorName,
            roiIncome: 0,
            rewardIncome: 0,
            rankIncome: 0,
            levelIncome: 0,
            directIncome: 0,
            indirectIncome: 0,
            depositBalance: 0,
            totalIncome: 0,
            joiningBonus: 0,
            investmentAmount: 0,
            activeIncome: 0,
          });

          // create level new for user
          await Level.create({
            fullName: user.fullName,
            userId: user.userId,
            email: user.email,
            sponsorId: user.sponsorId,
            level: [],
          });

          let currentSponsor = user;
          for (let i = 1; i <= 20; i++) {
            const levelUser = await Level.findOne({
              userId: currentSponsor.sponsorId,
            });

            if (levelUser) {
              await updateLevel(levelUser, user, i);
              currentSponsor = levelUser;
            } else {
              break;
            }
          }
          // send successfull email
          sendConfrimRegistrationMail(user, user.userId);
          // Send email verify email
          // sendVerificationMail(user);
          return res.status(201).json({
            message: "Registration successfull",
            user,
          });
        } else {
          return res.status(400).json({ message: "Invalid credintial" });
        }
      } else {
        return res.status(400).json({
          message: "Invalid OTP",
        });
      }
    } else {
      return res.status(400).json({
        message: "User Already Exists",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

const loginController = async (req, res) => {
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
    const { userId, password } = req.body;
    const user = await User.findOne({ userId: userId?.toUpperCase() });

    if (!user) {
      return res.status(400).json({ message: "User is not found" });
    }
    if (user.userStatus) {
      if (user && (await user.matchPassword(password))) {
        const token = generateToken(user.email);
        await User.findOneAndUpdate(
          { userId: user.userId?.toUpperCase() },
          {
            $set: {
              token: token,
            },
          },
          { new: true }
        );
        // Delete OTP
        await Otp.deleteOne({ email: user.email });
        return res.status(200).json({
          message: "Login successfull",
          token: token,
        });
      } else {
        return res.status(400).json({
          message: "Invalid username or password",
        });
      }
    } else {
      return res.status(400).json({
        message: "You are now blocked user. Please contact with support agent",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

const createOtpController = async (req, res) => {
  const {
    email, // this for register, change password, change trx password
    user_id, // this for login
    password, // this for login
    new_email,
    mobile,
    current_password,
    trx_address,
  } = req.body;
  const Otpcode = Math.floor(1000 + Math.random() * 9000); // Generate OTP code
  const expireTime = new Date().getTime() + 300 * 1000; // create expire time

  try {
    // withdraw
    if (user_id && trx_address) {
      const user = await User.findOne({ userId: user_id });
      if (user) {
        if (user.walletAddress === trx_address) {
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
            message: "Invalid trx address",
          });
        }
      } else {
        return res.status(400).json({
          message: "Invalid user credential",
        });
      }
    }
    // for register user
    if (email && mobile) {
      const existingOtp = Otp.findOne({ email: email });
      if (existingOtp) {
        await Otp.deleteOne({ email: email });
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
    }
    // for change password
    if (user_id && current_password) {
      const user = await User.findOne({ userId: user_id });
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
    // for change email
    if (user_id && new_email) {
      const user = await User.findOne({ userId: user_id.toUpperCase() });
      const existEmail = await User.findOne({ email: user?.email });
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

// Get Sponsor Name
const getSponsorNameController = async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findOne({ userId: userId });

  if (user) {
    return res.status(200).json({
      name: user.fullName,
    });
  } else {
    return res.status(400).json({
      message: "Invalid user ID",
    });
  }
};

// Send Forgot password link Mail
const ForgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Please Put email",
      });
    } else {
      const user = await User.findOne({ email: email });
      if (user) {
        let newToken = generateToken(user.email);
        const updateUser = await User.findByIdAndUpdate(
          { _id: user._id },
          {
            $set: {
              token: newToken,
            },
          },
          { new: true }
        );
        if (updateUser) {
          sendForgotPasswordMail(updateUser.email, updateUser.token);
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

// reset Password
const resetPasswordController = async (req, res) => {
  try {
    const tokenId = req.params.token;
    const { password } = req.body;
    if (tokenId) {
      const user = await User.findOne({ token: tokenId });
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
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// check mobile number
const checkMobileNumberController = async (req, res) => {
  try {
    const mobile = req.params.mobile;
    if (!mobile) {
      return res.status(400).json({
        message: "Please fill mobile number feild",
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
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// check email number
const checkEmailController = async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) {
      return res.status(400).json({
        message: "Please fill email feild",
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
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

// verify user
const verifyUser = async (req, res) => {
  let token = req.params.token;
  let decoded = verify_jwt(token);
  if (decoded.status) {
    let { id } = decoded.data;
    if (id) {
      let user_data_fetch = await User.findOne({ userId: id });
      if (user_data_fetch) {
        const updateUser = await User.findOneAndUpdate(
          { userId: user_data_fetch.userId },
          {
            $set: {
              userStatus: true,
            },
          },
          { new: true }
        );
        if (updateUser) {
          return res
            .status(200)
            .json({ message: "Email verified Successfully" });
        }
      }
    } else {
      return res.status(400).json({ message: "Unauthorized Email" });
    }
  } else {
    return res
      .status(400)
      .json({ message: "Your activation link has been exprired!" });
  }
};

// Get pdf link
const getPdfLink = async (_req, res) => {
  try {
    const result = await PDFData.findOne({ pdfId: "PDFID" });
    if (result) {
      return res.status(200).json({ data: result });
    } else {
      return res.status(400).json({ message: "There is no data" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: secretToken,
    });
    const { payload } = ticket;

    if (req.body.sponsorId) {
      const checkSponsorId = await User.findOne({
        username: req.body.sponsorId,
      });
      if (!checkSponsorId) {
        return r.rest(res, false, "Invalid sponsor id");
      }
    }
    const checkMobile = await User.findOne({
      mobile: req.body.mobile,
    });
    if (checkMobile) {
      return res.status(403).json("Already exist mobile");
    }
    function encryptPassword(plainPassword, saltRounds = 10) {
      return bcrypt.hashSync(plainPassword, saltRounds);
    }
    // const jwt_secret =
    //   "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTYzNzQ4OTY0NywiaWF0IjoxNjM3NDg5NjQ3fQ.oWajNoAvD8mojPMNMMEbDKVoug_H0DPnNUog7e1AV38";
    // const jwt_secret = process.env.SEC_KEY;
    // console.log({ jwt_secret });

    // function createJWT(obj) {
    //   return JWT.sign(obj, jwt_secret, {
    //     expiresIn: "1d",
    //     algorithm: "HS512",
    //   });
    // }

    if (payload) {
      const { picture, given_name, family_name, email, email_verified } =
        payload;

      if (email_verified) {
        const userExists = await User.findOne({ email: email });

        if (userExists) {
          // generate token only
          const token = generateToken({
            email: userExists.email,
            username: userExists.username,
            id: userExists._id,
          });
          return res.status(200).json({
            username: userExists.username,
            first_name: userExists.first_name,
            token: token,
            full_name: `${userExists.first_name} ${userExists.last_name}`,
            message: "Login success",
            isLoggedIn: true,
          });
        } else {
          // Create account and generate token
          let username;
          let password;
          let isUsernameUnique = false;
          let isMobileUnique = false;
          while (!isUsernameUnique && !isMobileUnique) {
            // username = generateRandomUsername(given_name, family_name);
            username = `${given_name} ${family_name}`;
            const isUserExists = await User.findOne({ username: username });
            const isMobileExists = await User.findOne({
              mobile: req.body.mobile,
            });

            if (!isUserExists) {
              isUsernameUnique = true;
            }

            if (!isMobileExists) {
              isMobileUnique = true;
            }
          }
          password = generateRandomPassword();
          let generatedUserId;
          let isUserIdUnique = false;
          generatedUserId = generateUniqueUserID();
          while (!isUserIdUnique) {
            // generatedUserId = generateUniqueUserID();
            const isUserExists = await User.findOne({
              userId: generatedUserId,
            });
            if (!isUserExists) {
              isUserIdUnique = true;
            }
          }
          // console.log(req.body?.sponsorid?.toUpperCase());
          const sponsorName = await User.findOne({
            userId: req.body?.sponsorid?.toUpperCase(),
          });

          console.log({ sponsorName });
          const user = await User.create({
            userId: generatedUserId,
            fullName: username,
            sponsorId: req.body.sponsorId || "admin",
            sponsorName: sponsorName.sponsorName || "admin",
            password: password,
            email: email,

            avatar: picture,
            token: generateToken(email),
            userStatus: true,
            isActive: false,
            joiningDate: new Date(getIstTime().date).toDateString(),
          });

          if (user) {
            // generate token only
            const token = generateToken({
              email: user.email,
              username: user.username,
              id: user._id,
            });

            // await TpTokenWallet.create({
            //   username: user.username,
            //   total_amount: parseFloat(0),
            //   total_dollar: parseFloat(0),
            //   self_token: parseFloat(0),
            //   level_token: parseFloat(0),
            //   reward_token: parseFloat(0),
            //   freeze_amount: parseFloat(0),
            //   distribute_amount: parseFloat(0),
            //   bonus_amount: parseFloat(0),
            //   roi_amount: parseFloat(0),
            // });

            sendConfrimRegistrationMail(user, user.userId);

            return res.status(200).json({
              username: user.username,
              first_name: user.first_name,
              token: token,
              full_name: user.fullName,
              message: "Account created successfully",
              isLoggedIn: true,
            });
          }
        }
      } else {
        return res.status(403).json("Email not verified");
      }
      return res.status(200).json(payload);
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json("Something went wrong");
  }
};
const checkIsLoggedIn = async (req, res) => {
  try {
    const exist = await User.findOne({ email: req.body.email });
    if (exist) {
      return res.status(200).json({
        isLoggedIn: true,
      });
    } else {
      return res.status(200).json({
        isLoggedIn: false,
      });
    }
  } catch (error) {
    return res.status.json("Something went wrong");
  }
};
const checkUserEmail = async (req, res) => {
  const email = req.params.userEmail;
  try {
    // Extract email from the request body
    const user = await User.findOne({ email: email });

    if (user) {
      return res.status(200).json({
        data: user,
      });
    } else {
      return res.status(404).json({
        message: "Invalid user Email",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.toString(),
    });
  }
};
const checkValidOTP = async (req, res) => {
  const otpCode = req.params.otpCode;
  try {
    const otp = await Otp.findOne({ code: otpCode });

    if (otp?.code == otpCode) {
      return res.status(200).json({
        data: otp,
      });
    } else {
      return res.status(404).json({
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

const getPeriodId = async (req, res) => {
  try {
    const periodId = await ProidId.find({});
    if (periodId) {
      return res.status(200).json({ data: periodId });
    } else {
      return res.status.json({ message: "Data Not Found!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

const getInitialTime = async (req, res) => {
  try {
    const result = await ProidId.findOne(
      {},
      { updatedAt: 1, _id: 0 },
      { updatedAt: -1 }
    );

    // console.log({ result });
    if (result) {
      return res.status(200).json({ data: result });
    } else {
      return res.status.json({ message: "Data Not Found!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

const getAllPeriodRecord = async (req, res) => {
  try {
    const allPeriodRecord = await PeriodRecord.find({}).sort({ createdAt: -1 });
    if (allPeriodRecord) {
      return res.status(200).json({ data: allPeriodRecord });
    } else {
      return res.status.json({ message: "Data Not Found!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
    });
  }
};
module.exports = {
  registerController,
  loginController,
  createOtpController,
  getSponsorNameController,
  ForgotPasswordController,
  resetPasswordController,
  checkMobileNumberController,
  checkEmailController,
  verifyUser,
  getPdfLink,
  googleLogin,
  checkIsLoggedIn,
  checkUserEmail,
  checkValidOTP,
  getPeriodId,

  getInitialTime,
  getAllPeriodRecord,
};
