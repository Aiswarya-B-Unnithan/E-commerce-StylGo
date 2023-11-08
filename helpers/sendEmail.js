
const transporter = require('../config/nodemailer')
require('dotenv').config()

const sendEmail=(to,subject,text)=>{
    const mailOptions={
        from:process.env.EMAIL_USER,
        to,
        subject,
        text,
    }
    
    transporter.sendMail(mailOptions,(error,info)=>{
        if(error)
            console.log('Error sending mail',error)
        else
            console.log('Email sent',info.response)
    })
}

module.exports=sendEmail