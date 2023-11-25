const nodemailer = require("nodemailer");

const sendMessageEmail = (name, user_id, email, message, subject, mobile) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "ABHIFX024@gmail.com",
      pass: "rxrctyzinknxitwc",
    },
  });
  
  let messageBody = `<div style="width: 640px; height: fit-content; margin-left: 50px; position: relative;">
   
        <div style="width: 100% ; height: 100; ">
            <img  style="width: 100%; height: 200px;" src="https://res.cloudinary.com/deavhufn6/image/upload/v1699159850/bb_bdtg5j.png" />
        </div>
        <p>${message}</p>
        <br />
        <p>${name}</p>
        <p>${email}</p>
        <p>${user_id}</p>
        <p>${mobile}</p>
    </div>`;

  let mailOption = {
    from: email,
    to: "ABHIFX024@gmail.com",
    subject: subject,
    html: messageBody,
  };

  transporter.sendMail(mailOption, async (error, info) => {});
};

module.exports = sendMessageEmail;
