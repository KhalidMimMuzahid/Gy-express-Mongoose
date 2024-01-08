const nodemailer = require("nodemailer");

const sendOtpMail = (email, otp) => {
  let transpoter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "keshav@triplewsols.org",
      pass: "nciozbzpcuxypmqn",
    },
  });
  console.log(otp);
  let mailOption = {
    from: "grow more",
    to: email,
    subject: "OTP Code",
    html: ` <div style="width: 640px; height: fit-content; margin-left: 50px; position: relative;">
        <p>Here is your OTP code: ${otp}</p>
        <br />
        <p>Regards,</p>
        <p>Grow More</p>
    </div>`,
  };

  transpoter.sendMail(mailOption, async (error, info) => {
    if (error) {
      console.log("hello Error", error);
    } else {
    }
  });
};

module.exports = sendOtpMail;
