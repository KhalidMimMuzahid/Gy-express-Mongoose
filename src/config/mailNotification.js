const nodemailer = require("nodemailer");

const sendEmailNotification = (
  user_id,
  name,
  email,
  subject,
  amount,
  message,
  type
) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "ABHIFX024@gmail.com",
      pass: "rxrctyzinknxitwc",
    },
  });

  let messageBody = `<div>
        <strong>Hello Dear,</strong> <br/>
        <p>User ID: ${user_id} and Name: ${name}</p>
        <p>We have an important update regarding your ${type} request for <strong>$${amount}</strong> amount:</p>
        <p>${message}</p>
        <p>
          For further details or assistance, please contact our customer support team at ABHIFX024@gmail.com. <br/>
          Thank you for choosing abhifx024.
        </p>
        Best regards, <br/>
        abhifx024
    </div>`;

  let mailOption = {
    from: "abhifx024",
    to: email,
    subject: subject,
    html: messageBody,
  };

  transporter.sendMail(mailOption, async (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendEmailNotification;
