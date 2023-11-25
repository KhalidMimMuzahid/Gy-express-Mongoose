const nodemailer = require("nodemailer");

const sendOtpMail = (email, otp) => {
  let transpoter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "ABHIFX024@gmail.com",
      pass: "rxrctyzinknxitwc",
    },
  });
  console.log(otp);
  let mailOption = {
    from: "abhifx024",
    to: email,
    subject: "OTP Code",
    html: ` <div style="width: 640px; height: fit-content; margin-left: 50px; position: relative;">
   
          <div style="width: 100% ; height: 100; ">
              <img  style="width: 100%; height: 200px;" src="https://res.cloudinary.com/deavhufn6/image/upload/v1699159850/bb_bdtg5j.png" />
          </div>
        <p>Here is your OTP code: ${otp}</p>
        <br />
        <p>Regards,</p>
        <p>abhifx024</p>
    </div>`,
  };

  transpoter.sendMail(mailOption, async (error, info) => {
    if (error) {
      
      console.log("hello Error",error)
    } else {
    }
  });
};

module.exports = sendOtpMail;
