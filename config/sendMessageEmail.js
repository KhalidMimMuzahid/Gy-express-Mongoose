const nodemailer = require("nodemailer");

const sendMessageEmail = (name, user_id, email, message, subject, mobile) => {
  let transporter = nodemailer.createTransport({
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

  let messageBody = `<div>
        <p>${message}</p>
        <br />
        <p>${name}</p>
        <p>${email}</p>
        <p>${user_id}</p>
        <p>${mobile}</p>
    </div>`;

  let mailOption = {
    from: email,
    to: "mybusinessotp@gmail.com",
    subject: subject,
    html: messageBody,
  };

  transporter.sendMail(mailOption, async (error, info) => {
  });
};

module.exports = sendMessageEmail;
