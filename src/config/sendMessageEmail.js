const nodemailer = require("nodemailer");

const sendMessageEmail = (name, user_id, email, message, subject, mobile) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "keshav@triplewsols.org",
      pass: "nciozbzpcuxypmqn",
    },
  });

  let messageBody = `<div style="width: 640px; height: fit-content; margin-left: 50px; position: relative;">
   
        
        <p>${message}</p>
        <br />
        <p>${name}</p>
        <p>${email}</p>
        <p>${user_id}</p>
        <p>${mobile}</p>
    </div>`;

  let mailOption = {
    from: email,
    to: "keshav@triplewsols.org",
    subject: subject,
    html: messageBody,
  };

  transporter.sendMail(mailOption, async (error, info) => {});
};

module.exports = sendMessageEmail;
