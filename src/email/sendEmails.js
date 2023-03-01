const sgMail = require("@sendgrid/mail")

const key = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(key)


function sendWelcomeEmail(email, name) {

    // sgMail.send({
    //     to: email,
    //     from: "i.mahmoudselim@outlook.com",
    //     cc: "me.mahmoudselim@gmail.com",
    //     subject: 'Welcoming Mail',
    //     html: `<strong> 
    //             Dear ${name}, 
    //             Thank you for joining. 
    //             We will review your application and contact you shortly. 
    //             Best regards
    //             </strong>`,
    // })
}
function sendCancelEmail(email, name) {

    // sgMail.send({
    //     to: email,
    //     from: "i.mahmoudselim@outlook.com",

    //     cc: "me.mahmoudselim@gmail.com",
    //     subject: 'GoodBye Mail',
    //     html: `<strong> 
    //             Dear ${name}, 
    //             Goob Bye.  
    //             Best regards
    //             </strong>`,
    // })
}
module.exports = {
    sendWelcomeEmail,
    sendCancelEmail

}