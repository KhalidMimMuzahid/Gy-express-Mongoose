const nodemailer = require("nodemailer");

const sendConfirmRegistrationMail = (user, userId) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    // auth: {
    //   user: "hashprogroup@gmail.com",
    //   pass: "echucqvfyduqyayz",
    // },
    // auth: {
    //   user: "mybusinessotp@gmail.com",
    //   pass: "mgmsvlkjtdjxlccc",
    // },
    auth: {
      user: "myotpbusiness@gmail.com",
      pass: "igatokoydxmqtwtm",
    },
  });

  let mailOption = {
    from: "Hash Pro",
    to: user.email,
    subject: "Successfully registered",
    text: `Hello! ${user.name}
            Here is you user information - 
            Full Name: ${user.name}
            user ID: ${userId}
            Sponsor ID: ${user.sponsor_id}
            Sponsor Name: ${user.sponsor_name}
            Mobile: ${user.mobile}
            Email: ${user.email}`,
    html: `<div>
    <h1 style="text-align: center;">Welcome to <a href="https://hashpro.network">Hash Pro</a></h1>
    <div  style="padding: 0 60px; width: 100%;">
            <h2>Hello! ${user.name},</h2>
            <p style="text-align: left;">Here is you ID information - </p>
            <p style="text-align: left; margin-left: 20px">Full Name: ${user.name}</p>
            <p style="text-align: left; margin-left: 20px">user ID: ${user.user_id}</p>
            <p style="text-align: left; margin-left: 20px">Sponsor ID: ${user.sponsor_id}</p>
            <p style="text-align: left; margin-left: 20px">Sponsor Name: ${user.sponsor_name}</p>
            <p style="text-align: left; margin-left: 20px">Mobile: ${user.mobile}</p>
            <p style="text-align: left; margin-left: 20px">Email: ${user.email}</p>      
    </div>
</div>`,
  };

  transporter.sendMail(mailOption, async (error, info) => {
    if (error) {
      //console.log(error);
    } else {
      //console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendConfirmRegistrationMail;
