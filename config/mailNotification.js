const nodemailer = require("nodemailer");

const sendEmailNotification = (
    user_id,
    name,
    subject,
    amount,
) => {
    let transporter = nodemailer.createTransport({
        service: "Gmail",
        port: 587,
        secure: false,
        // auth: {
        //     user: "mybusinessotp@gmail.com",
        //     pass: "mgmsvlkjtdjxlccc",
        // },
        // auth: {
        //     user: "hashprogroup@gmail.com",
        //     pass: "echucqvfyduqyayz",
        // },
        auth: {
            user: "myotpbusiness@gmail.com",
            pass: "igatokoydxmqtwtm",
        },
    });

    let messageBody = `<div>
        <strong>Hello Admin,</strong> <br/>
        <p>I hope this message finds you well. We wanted to inform you of a recent deposit made by one of our users. Here are the details:</p>
        <p>
            User ID: ${user_id} <br/>
            Full Name: ${name} <br/>
            Deposit Amount: ${amount}
        </p>
        <p>
          This deposit is an important part of our financial operations, and we wanted to keep you in the loop. If you need any further information or have any questions regarding this deposit, please don't hesitate to reach out to us.
        </p>
        Best regards, <br/>
        Hashpro Network Team
    </div>`;

    let mailOption = {
        from: "mybusinessotp@gmail.com",
        to: "mybusinessotp@gmail.com",
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