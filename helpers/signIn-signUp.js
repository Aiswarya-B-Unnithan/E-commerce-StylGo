const bcrypt=require('bcrypt')
const transporter = require('../config/nodemailer')
require('dotenv').config()


const securePassword=async(password)=>{
    try{
      const hashedPassword=await bcrypt.hash(password,10)
      return hashedPassword
  
    }catch(error){
      console.log("error while hashing")
    } 
}
const validateName=(name)=>{
    const nameParts=name.split(/\s+/).filter(part=>part.trim()!=='')

        if(nameParts.length>=2){
            const isValid=nameParts.every(part=>{
               return( /^[A-Za-z]+$/.test(part))             
            })
            if(!isValid){
                return {message:'Enter characters only'}
            }
        }else{
            return {message:'Enter full name'}
        }
}
const validatePassword=(password)=>{
    var regularExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if (password.length < 8) {
        return { message: 'Password must be at least 8 characters long' };
    }else if(!(regularExpression.test(password))){
        return { message: 'Password must contain atleast one number and one special character' }
    }
}
const validateNo=(num)=>{
    mobileNo=num.trim()       
    if((!(/^[0-9]+$/.test(mobileNo)))||(mobileNo.length!==10)){
        return {message:'Invalid mobile number'}
    }
}

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


module.exports={securePassword,validateName,validateNo,validatePassword,sendEmail}