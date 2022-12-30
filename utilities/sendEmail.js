const nodemailer = require('nodemailer');

const sendEmail = async (subject,message,send_to,send_from,reply_to) => {
    const Transporter = nodemailer.createTransport({
        service: "gmail",
        auth:{
            user: process.env.MAILER_USER_MAIL,
            pass:process.env.MAILER_USER_PWD
        }
    });
    const options = {
        from: send_from,
        to: send_to,
        replyTo: reply_to,
        subject:subject,
        html: message
    }
    Transporter.sendMail(options, (err,info) => {
        if(err){
            console.log(error);
        }else{
            console.log(info);
        }
    });   
}
module.exports = sendEmail;