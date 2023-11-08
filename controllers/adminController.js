const Admin = require('../models/admin')
const sendEmail = require('../helpers/sendEmail')


const path = require('path')
//const sharp = require('sharp')

//get to store admin data
let admin = null

//first page- login page get login

const getLogin = (req, res) => {
    if (!req.session.adminAuthenticated)
        res.render('admin/login', { layout: false })
    else
        res.redirect('/admin/dashboard')

}

//post login

const postLogin = async (req, res) => {
    const { email, password } = req.body
    try {
        const adminData = await Admin.findOne({ email })

        if (adminData) {
            const isMatchPassword = adminData.password === password

            if (isMatchPassword) {
                //copy to get in otp page
                admin = adminData
                //generate otp and mail data
                const otp = Math.floor(100000 + Math.random() * 900000).toString()
                const sub = 'Login OTP'
                const msg = `Your OTP for Login : ${otp}`
                //save otp to user
                adminData.otp = otp
                await adminData.save()
                //send email
                try {
                    sendEmail(email, sub, msg)
                    res.render('admin/otp', { layout: false })


                } catch (error) {
                    console.log('Error in sending mail', error)
                    res.status(500).json({ error: 'Internal Server Error' })
                }

            } else {
                res.render('admin/login', { layout: false, error: { message: 'Incorrect username or password' } })
            }
        } else {
            res.render('admin/login', { layout: false, error: { message: 'Incorrect username or password' } })
        }
    } catch (e) {
        console.log('post login error', e.message)
    }
}
//post otp
const postOtp = async (req, res) => {
    const { num1, num2, num3, num4, num5, num6 } = req.body
    const otpToValidate = num1 + num2 + num3 + num4 + num5 + num6

    if (otpToValidate === admin.otp) {
        req.session.adminAuthenticated = true
        res.redirect('/admin/dashboard')
    } else {
        res.render('admin/otp', { layout: false, error: { message: 'Invalid Otp' } })
    }
}
//post resend
const postResend = async (req, res) => {
    //generate otp and mail data
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const email = admin.email
    const sub = 'Login OTP'
    const msg = `Your OTP for Login : ${otp}`
    //save otp to user
    admin.otp = otp
    await admin.save()
        .then((data) => {
            console.log('saved data during resend', data)
        }).catch((er) => {
            console.log('error durin resend save data', er)
        })

    //send email
    try {
        sendEmail(email, sub, msg)
        res.render('admin/otp', { layout: false })

    } catch (error) {
        console.log('Error in sending mail', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

const getDashboard = async (req, res) => {
    res.render('admin/dashboard', { layout: './layout/admin-main' })
}
module.exports = {
    getLogin, 
    postLogin, 
    postOtp, 
    postResend, 
    getDashboard
}