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
  // user: "keshav@triplewsols.org",
  // pass: "nciozbzpcuxypmqn",
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "keshav@triplewsols.org",
      pass: "nciozbzpcuxypmqn",
    },
  });

  let messageBody = `<div>
        <strong>Hello Dear,</strong> <br/>
        <p>User ID: ${user_id} and Name: ${name}</p>
        <p>We have an important update regarding your ${type} request for <strong>$${amount}</strong> amount:</p>
        <p>${message}</p>
        <p>
          For further details or assistance, please contact our customer support team at growmoretodaypro@gmail.com. <br/>
          Thank you for choosing Grow More.
        </p>
        Best regards, <br/>
        Grow More
    </div>`;

  let mailOption = {
    from: "Grow More",
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
