const nodemailer = require("nodemailer");

const sendForgotPasswordMail = (email, token) => {
  const reset_password_url = `http://growmore.today/resetpassword/${token}`;
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "keshav@triplewsols.org",
      pass: "nciozbzpcuxypmqn",
    },
  });

  let mailOption = {
    from: "grow more",
    to: email,
    subject: "Forgot Password",
    html: `<div style="width: 640px; height: fit-content; margin-left: 50px; position: relative;">
      
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
    <a>grow more</a>
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
