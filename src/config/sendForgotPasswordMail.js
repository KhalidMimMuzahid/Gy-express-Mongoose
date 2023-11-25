const nodemailer = require("nodemailer");

const sendForgotPasswordMail = (email, token) => {
  const reset_password_url = `https://abhifx024.com/resetpassword/${token}`;
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "ABHIFX024@gmail.com",
      pass: "rxrctyzinknxitwc",
    },
  });

  let mailOption = {
    from: "abhifx024",
    to: email,
    subject: "Forgot Password",
    html: `<div style="width: 640px; height: fit-content; margin-left: 50px; position: relative;">
      <div style="width: 100% ; height: 100; ">
          <img  style="width: 100%; height: 200px;" src="https://res.cloudinary.com/deavhufn6/image/upload/v1699159850/bb_bdtg5j.png" />
      </div>
    <div style="width: 100%">
      <p style="width: 100%; text-align: center">
        Please click the button below to reset your password.
      </p>
      <p style="width: 100%; text-align: center; margin-top: 30px">
        <a
          href="${reset_password_url}"
          style="
            padding: 12px 8px;
            background-color: #348edb;
            color: #ffff;
            cursor: pointer;
            text-decoration: none;
          "
          >reset password</a
        >
      </p>
    </div>
    <p>Regards,</p>
    <a>abhifx024</a>
  </div>`,
  };

  transporter.sendMail(mailOption, async (error, info) => {
    if (error) {
      //console.log(error);
    } else {
      //console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendForgotPasswordMail;
