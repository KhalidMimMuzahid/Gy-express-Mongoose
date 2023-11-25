const nodemailer = require("nodemailer");

const sendConfirmRegistrationMail = (user, userId) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: "ABHIFX024@gmail.com",
      pass: "rxrctyzinknxitwc",
    },
  });

  let mailOption = {
    from: "abhifx024",
    to: user.email,
    subject: "Successfully Registered",
    text: `Hello! ${user.fullName}
            Here is you user information - 
            Full Name: ${user.fullName}
            user ID: ${userId}
            Sponsor ID: ${user.sponsorId}
            Mobile: ${user.mobile}
            Email: ${user.email}`,
    html: `<div style="width: 640px; height: fit-content; margin-left: 50px; position: relative;">
   
        <div style="width: 100% ; height: 100; ">
            <img  style="width: 100%; height: 200px;" src="https://res.cloudinary.com/deavhufn6/image/upload/v1699159850/bb_bdtg5j.png" />
        </div>
        <div>
        <h1 style="text-align: center;">Welcome to <a href="https://abhifx024.com">abhifx024</a></h1>
        <div  style="padding: 0 60px; width: 100%;">
           
    </div>
    <div style="margin: 0; padding: 0;">
        <h4 style="font-weight: 600; font-size: 15px; margin: 5px; color: black;"> Hi ${user.fullName},</h4>
    </div>
    <hr/>
   <div>

 
    <div style="margin-top: 10px; ">
        <h2 style="font-weight: 600; color: black;">Here's Your Login Information:</h2>
    </div>

    <div style="margin: 0px; padding: 0px;">
    <div style="display: flex; flex-direction: row;">
        <div style="padding: 0px; margin: 0px; float: left; width: 200px;">
            <P style="font-size: 15px; font-weight: 600; margin: 0; color: black; ">User Id:</P>
        </div>
        <div style="margin-left: 1px;">
            <p style="font-size: 15px; font-weight: 200; margin: 0; color: black;" >${user.userId}</p>
        </div>
    </div>
    <div style="display: flex; flex-direction: row; margin-top: 5px;">
        <div style="padding: 0px; margin: 0px; float: left; width: 200px;">
            <P style="font-size: 15px; font-weight: 600; margin: 0; color: black; ">Name:</P>
        </div>
        <div style="margin-left: 1px;">
            <p style="font-size: 15px; font-weight: 200; margin: 0; color: black;" >${user.fullName}</p>
        </div>
    </div>
    <div style="display: flex; flex-direction: row; margin-top: 5px;">
        <div style="padding: 0px; margin: 0px; float: left; width: 200px;">
            <P style="font-size: 15px; font-weight: 600; margin: 0; color: black;">Sponsor Id:</P>
        </div>
        <div style="margin-left: 1px;">
            <p style="font-size: 15px; font-weight: 200; margin: 0; color: black;" >${user.sponsorId}</p>
        </div>
    </div>
    <div style="display: flex; flex-direction: row; margin-top: 5px;">
        <div style="padding: 0px; margin: 0px; float: left; width: 200px;">
            <P style="font-size: 15px; font-weight: 600; margin: 0; color: black; ">Sponsor Name:</P>
        </div>
        <div style="margin-left: 1px;">
            <p style="font-size: 15px; font-weight: 200; margin: 0; color: black;" >${user.sponsorName}</p>
        </div>
    </div>
    
    <div style="display: flex; flex-direction: row; margin-top: 5px;">
        <div style="padding: 0px; margin: 0px; float: left; width: 200px;">
            <P style="font-size: 15px; font-weight: 600; margin: 0; color: black; ">Mobile Number:</P>
        </div>
        <div style="margin-left: 1px;">
            <p style="font-size: 15px; font-weight: 200; margin: 0; color: black;" >${user.mobile}</p>
        </div>
    </div>
    <div style="display: flex; flex-direction: row; margin-top: 5px;">
        <div style="padding: 0px; margin: 0px; float: left; width: 200px;">
            <P style="font-size: 15px; font-weight: 600; margin: 0; color: black; ">Email:</P>
        </div>
        <div style="margin-left: 1px;">
            <p style="font-size: 15px; font-weight: 200; margin: 0; color: black;" >${user.email}</p>
        </div>
    </div>
    
    </div>
    <div style="height: 50px; width: 300px; background-color: green; margin: 30px; border-radius: 5px;">
        <a href="https://abhifx024.com/login" style="display: block; height: 100%; width: 100%; color: white; text-decoration: none; font-size: 20px; text-align: center; line-height: 50px;">Login Now</a>
    </div>
           
   </div>
   <hr/>
   <div>
    <h3 style="color: black;">Thanks for Choosing ABHIFX024</h3>
    <h3 style="color: black;">- The ABHIFX024 Team </h3>
   </div>
</div>`,
  };

  transporter.sendMail(mailOption, async (error, info) => {
    if (error) {
      console.log(error);
    } else {
      // console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendConfirmRegistrationMail;
