const nodemailer = require("nodemailer");
const sendVerificationMail = async (user) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "ABHIFX024@gmail.com",
      pass: "rxrctyzinknxitwc",
    },
  });
  const mailOptions = {
    from: "ABHIFX024",
    to: user?.email,
    subject: "Verify Your Email",
    html: `<div style="width: 640px; height: fit-content; margin-left: 50px; position: relative;">
   
          <div style="width: 100% ; height: 100; ">
              <img  style="width: 100%; height: 200px;" src="https://res.cloudinary.com/deavhufn6/image/upload/v1699159850/bb_bdtg5j.png" />
          </div>
      <div style="width: 100%">
        <p style="width: 100%; text-align: center">
          Thank you to joining on abhifx024. Please use the link below to
          verify your email.
        </p>
        <p style="width: 100%; text-align: center; margin-top: 30px">
          <a
            href="https://abhifx024.com/login/${user?.token}"
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
      <a target="_blank" href="https://abhifx024.com">abhifx024</a>
    </div>`,
  };

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
    } else {
    }
  });
};
module.exports = sendVerificationMail;
