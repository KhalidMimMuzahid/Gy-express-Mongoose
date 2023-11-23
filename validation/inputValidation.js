const { check, validationResult, body } = require("express-validator");
const User = require("../models/userModel");

// register
const registerValidators = [
  check("sponsor_name")
    .notEmpty()
    .withMessage("Sponsor name is required")
    .custom(async (sponsor_name, { req }) => {
      const exist_sponsor = await User.findOne({
        user_id: req.body.sponsor_id,
      });
      if (sponsor_name !== exist_sponsor?.name) {
        throw new Error("Sponsor name is not matched, given sponsor id");
      }
      return true;
    }),
  check("sponsor_id")
    .notEmpty()
    .withMessage("Sponsor Id is required")
    .custom(async (sponsor_id) => {
      const exist_sponsor = await User.findOne({
        user_id: sponsor_id,
      });
      if (!exist_sponsor) {
        throw new Error("Invalid sponsor id");
      }
      return true;
    }),

  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Please write only character"),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({
      min: 6,
    })
    .withMessage("Please Write More than 6 characters")
    .matches(/[!@#$%^&*()_+{:;"'|/}]/)
    .withMessage("Please write atleast one special character")
    .matches(/[0-9]/)
    .withMessage("Please write atleast one number"),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please Write Valid Email"),

  check("mobile")
    .notEmpty()
    .withMessage("Mobile Number is required")
    .isNumeric()
    .withMessage("Mobile Number should be Number"),
];

const registerValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.send({
      errors: mappedErrors,
    });
  }
};

// login
const loginValidators = [
  check("user_id").notEmpty().withMessage("Sponsor Id is required"),
  check("password").notEmpty().withMessage("Password is required"),
];

const loginValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.send({
      errors: mappedErrors,
    });
  }
};

// forgotPassword
const forgotPasswordValidators = [
  check("user_id").notEmpty().withMessage("Email is required"),
];

const forgotPasswordValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.send({
      errors: mappedErrors,
    });
  }
};

// resetPassword
const resetPasswordValidators = [
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({
      min: 6,
    })
    .withMessage("Please Write More than 6 characters")
    .matches(/[!@#$%^&*()_+{:;"'|/}]/)
    .withMessage("Please write atleast one special character")
    .matches(/[0-9]/)
    .withMessage("Please write atleast one number"),
];

const resetPasswordValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.send({
      errors: mappedErrors,
    });
  }
};

// updatePassword
const updatePasswordValidators = [
  check("new_password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({
      min: 6,
    })
    .withMessage("Please Write More than 6 characters")
    .matches(/[!@#$%^&*()_+{:;"'|/}]/)
    .withMessage("Please write atleast one special character")
    .matches(/[0-9]/)
    .withMessage("Please write atleast one number"),
];

const updatePasswordValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.send({
      errors: mappedErrors,
    });
  }
};

// updateTrxPassword
const updateTrxPasswordValidators = [
  check("current_trx_password").notEmpty().withMessage("Password is required"),
  check("new_trx_password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({
      min: 10,
    })
    .withMessage("Please Write More than 6 characters")
    .matches(/[!@#$%^&*()_+{:;"'|/}]/)
    .withMessage("Please write atleast one special character")
    .matches(/[0-9]/)
    .withMessage("Please write atleast one number"),
];

const updateTrxPasswordValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.send({
      errors: mappedErrors,
    });
  }
};

// updateEmail
const updateEmailValidators = [
  check("new_email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please Write Valid Email"),
];

const updateEmailValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.send({
      errors: mappedErrors,
    });
  }
};

// topup
const topupValidators = [
  check("user_id").notEmpty().withMessage("User ID is required"),
  check("trx_password").notEmpty().withMessage("TRX password is required"),
  check("packages").notEmpty().withMessage("Packages is required"),
];

const topupValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.send({
      errors: mappedErrors,
    });
  }
};

// fundTransfer
// const fundTransferValidators = [
//     check("receiver_id")
//         .notEmpty()
//         .withMessage("Receiver ID is required"),
//     check("amount")
//         .notEmpty()
//         .withMessage("Amount is required"),
// ];

const fundTransferValidators = [
  body("receiver_id")
    .not()
    .isEmpty()
    .withMessage("Receiver id is required")
    .custom(async (receiver_id) => {
      const exist_receiver_id = await User.findOne({
        user_id: receiver_id,
      });
      if (!exist_receiver_id) {
        throw new Error("Cannot find receiver username");
      }
      return true;
    })
    .trim(),
  body("trx_password")
    .not()
    .isEmpty()
    .withMessage("TRX password is required")
    .custom(async (trx_password) => {
      const exist_trx_pass = await User.findOne({
        trx_password: trx_password,
      });
      if (!exist_trx_pass) {
        throw new Error("Invalid trx password");
      }
      return true;
    })
    .trim(),
  body("amount").not().isEmpty().withMessage("Amount is required").trim(),
];

//   Booster upgrade validation
const boosterUpgradeValidation = [
  body("user_id")
    .not()
    .isEmpty()
    .withMessage("Receiver id is required")
    .custom(async (user_id) => {
      const exist_user_id = await User.findOne({
        user_id: user_id,
      });
      if (!exist_user_id) {
        throw new Error("Cannot find user Id");
      }
      return true;
    })
    .trim(),
  // body("trx_password")
  //   .not()
  //   .isEmpty()
  //   .withMessage("TRX password is required")
  //   .custom(async (trx_password) => {
  //     const exist_trx_pass = await User.findOne({
  //         trx_password: trx_password,
  //     });
  //     if (!exist_trx_pass) {
  //       throw new Error("Invalid trx password");
  //     }
  //     return true;
  //   })
  //   .trim(),
  body("packages").not().isEmpty().withMessage("Package is required").trim(),
];

// const fundTransferValidationHandler = function (req, res, next) {
//     const errors = validationResult(req);
//     const mappedErrors = errors.mapped();
//     if (Object.keys(mappedErrors).length === 0) {
//         next();
//     } else {
//         res.send({
//             errors: mappedErrors,
//         })
//     }
// };

// depositAmount
const depositAmountValidators = [
  check("user_id").notEmpty().withMessage("User ID is required"),
  check("amount").notEmpty().withMessage("Amount is required"),
  check("proof").notEmpty().withMessage("Proof is required"),
];

const depositAmountValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.send({
      errors: mappedErrors,
    });
  }
};

// topupAccount
const topupAccountValidators = [
  check("user_id").notEmpty().withMessage("User ID is required"),
  check("packages").notEmpty().withMessage("Packages is required"),
];

const topupAccountValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.send({
      errors: mappedErrors,
    });
  }
};

// updateTxrAddress
const updateTxrAddressValidators = [
  check("trx_address").notEmpty().withMessage("TRX address is required"),
  check("trx_password")
    .not()
    .isEmpty()
    .withMessage("TRX password is required")
    .custom(async (trx_password) => {
      const exist_trx_pass = await User.findOne({
        trx_password: trx_password,
      });
      if (!exist_trx_pass) {
        throw new Error("Invalid trx password");
      }
      return true;
    })
    .trim(),
];

const updateTxrAddressValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.send({
      errors: mappedErrors,
    });
  }
};

// supportTicket
const supportTicketValidators = [
  check("purpose").notEmpty().withMessage("purpose is required"),
  check("previous_ticket_reff").notEmpty().withMessage("select your Complaint"),
  check("question").notEmpty().withMessage("write your description please"),
];

const supportTicketValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.send({
      errors: mappedErrors,
    });
  }
};

// contactus
const contactusValidators = [
  check("name").notEmpty().withMessage("name is required"),
  check("email").notEmpty().withMessage("email is required"),
  check("user_id").notEmpty().withMessage("User ID is required"),
  check("message").notEmpty().withMessage("message is required"),
];

const contactusValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.send({
      errors: mappedErrors,
    });
  }
};

// createUpdate
const createUpdateValidators = [
  check("title").notEmpty().withMessage("title is required"),
  check("description").notEmpty().withMessage("description is required"),
];

const createUpdateValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.send({
      errors: mappedErrors,
    });
  }
};

// Contact
const ContactValidators = [
  check("name").notEmpty().withMessage("name is required"),
  check("user_id").notEmpty().withMessage("user_id is required"),
  check("email").notEmpty().withMessage("email is required"),
  check("message").notEmpty().withMessage("message is required"),
  check("subject").notEmpty().withMessage("subject is required"),
  check("mobile").notEmpty().withMessage("mobile is required"),
];

const ContactValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.send({
      errors: mappedErrors,
    });
  }
};

module.exports = {
  registerValidators,
  registerValidationHandler,
  loginValidators,
  loginValidationHandler,
  forgotPasswordValidators,
  forgotPasswordValidationHandler,
  resetPasswordValidators,
  resetPasswordValidationHandler,
  updatePasswordValidators,
  updatePasswordValidationHandler,
  updateTrxPasswordValidators,
  updateTrxPasswordValidationHandler,
  updateEmailValidators,
  updateEmailValidationHandler,
  topupValidators,
  topupValidationHandler,
  fundTransferValidators,
  depositAmountValidators,
  depositAmountValidationHandler,
  topupAccountValidators,
  topupAccountValidationHandler,
  updateTxrAddressValidators,
  updateTxrAddressValidationHandler,
  supportTicketValidators,
  supportTicketValidationHandler,
  contactusValidators,
  contactusValidationHandler,
  createUpdateValidators,
  createUpdateValidationHandler,
  ContactValidators,
  ContactValidationHandler,
  boosterUpgradeValidation,
};
