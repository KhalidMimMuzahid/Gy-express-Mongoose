const nodemailer = require("nodemailer");
const sendVerificationMail = async (user) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "keshav@triplewsols.org",
      pass: "nciozbzpcuxypmqn",
    },
  });
  const mailOptions = {
    from: "grow more",
    to: user?.email,
    subject: "Verify Your Email",
    html: `<div style="width: 640px; height: fit-content; margin-left: 50px; position: relative;">
       <div style="width: 100%">
        <p style="width: 100%; text-align: center">
          Thank you to joining on grow more. Please use the link below to
          verify your email.
        </p>
        <p style="width: 100%; text-align: center; margin-top: 30px">
          <a
            href="http://growmore.today/login/${user?.token}"
            style="
              padding: 12px 8px;
              background-color: #348edb;
              color: #ffff;
              cursor: pointer;
              text-decoration: none;
            "
            >Verify Email</a
          >
        </p>
      </div>
      <p>Regards,</p>
      <a target="_blank" href="http://growmore.today">Grow More</a>
    </div>`,
  };

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
    } else {
    }
  });
};
module.exports = sendVerificationMail;
