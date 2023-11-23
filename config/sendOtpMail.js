const nodemailer = require("nodemailer");

const sendOtpMail = (email, otp) => {
  let transpoter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    // auth: {
    //   user: "hashprogroup@gmail.com",
    //   pass: "echucqvfyduqyayz",
    // },
    // // auth: {
    // //   user: "mybusinessotp@gmail.com",
    // //   pass: "mgmsvlkjtdjxlccc",
    // // },
    auth: {
      user: "myotpbusiness@gmail.com",
      pass: "igatokoydxmqtwtm",
    },
  });
  console.log(otp);
  let mailOption = {
    from: "Hash Pro",
    to: email,
    subject: "OTP Code",
    html: `<div>
        <p>Here is your OTP code: ${otp}</p>
        <br />
        <p>Regards,</p>
        <p>Hash Pro</p>
    </div>`,
  };

  transpoter.sendMail(mailOption, async (error, info) => {
    if (error) {
    } else {
    }
  });
};

module.exports = sendOtpMail;
