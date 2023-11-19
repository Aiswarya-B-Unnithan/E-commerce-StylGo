
const Categories=require('../models/category')
const User=require('../models/user')
const bcrypt=require('bcrypt')
const helpers=require('../helpers/signIn-signUp')
const Cart=require('../models/cart')
const users=require('../models/user')


//to get data from login route to otp
let userFromLogin = null


//========================LOGIN SIGNUP=======================
//get login
const getLogin = async (req, res) => {
    try {
        const categories = await Categories.find({ isValid: true })
        const additionalData = categories//to set in headers , the categories

        res.render('user/login', { layout: './layout/user-main', additionalData })
    }
    catch (e) {
        console.log('error in login page : ', e.message)
    }

}
//post login
const postLogin = async (req, res) => {
    const { email, password } = req.body

    try {
        const userData = await User.findOne({ email })
        const categories = await Categories.find({ isValid: true })
        const additionalData = categories

        if (userData) {
            const isMatchPassword = await bcrypt.compare(password, userData.password)
            const isUnblocked = !(userData.isBlocked)

            if (isMatchPassword) {
                //if username ,password match check if blocked or not
                if (isUnblocked) {
                    //generate otp and mail data
                    const otp = Math.floor(100000 + Math.random() * 900000).toString()
                    const sub = 'Login OTP'
                    const msg = `Your OTP for Login : ${otp}`
                    //save otp to user
                    userData.otp = otp
                    await userData.save()
                    //save to get in otp route
                    userFromLogin = userData
                    //send email
                    try {
                        helpers.sendEmail(email, sub, msg)
                        res.render('user/otp', { layout: false, additionalData })  //for easy work just hide
                        
                    } catch (error) {
                        console.log('Error in sending mail', error)
                        res.status(500).json({ error: 'Internal Server Error' })
                    }
                } else {
                    res.render('user/login', { layout: './layout/user-main', error: { message: 'Account blocked by the admin' }, additionalData })
                }
            } else {
                res.render('user/login', { layout: './layout/user-main', error: { message: 'Incorrect username or password' }, additionalData })
            }
        } else {
            res.render('user/login', { layout: './layout/user-main', error: { message: 'Incorrect username or password' }, additionalData })
        }
    } catch (e) {
        console.log('post login error', e)
    }


}

//post otp
const postOtp = async (req, res) => {
    const { num1, num2, num3, num4, num5, num6 } = req.body
    const otpToValidate = num1 + num2 + num3 + num4 + num5 + num6
    try {
        const categories = await Categories.find({ isValid: true })

        const additionalData = categories

        if (otpToValidate === userFromLogin.otp) {
            
            req.session.authenticated = true
                        req.session.user = userFromLogin
                        const cart = await Cart.findOne({ user: userFromLogin._id })
                        if (cart){
                                
                            req.session.cartQuantity = cart.totalQuantity
                        }
                        if (req.session.returnTo) {
                            const returnTo = req.session.returnTo;
                            delete req.session.returnTo; // Remove the stored referrer URL
                            res.redirect(returnTo); // Redirect the user to the referrer URL

                        } else {
                            res.redirect('/')
                        }

        } else {
            res.render('user/otp', { layout: false, error: { message: 'Invalid Otp', additionalData } })
        }

    } catch (e) {
        console.log(e)
    }

}
//post resend

const postResend = async (req, res) => {
    try {
        //generate otp and mail data
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const email = userFromLogin.email
        const sub = 'Login OTP'
        const msg = `Your OTP for Login : ${otp}`
        //save otp to user
        userFromLogin.otp = otp
        await userFromLogin.save()

        const categories = await Categories.find({ isValid: true })
        const additionalData = categories

        //send email

        helpers.sendEmail(email, sub, msg)
        res.render('user/otp', { layout: false, additionalData })

    } catch (error) {
        console.log('Error in sending mail', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
//get signup
const getSignUp = async (req, res) => {
    //res.render('user/profile',{layout:'./layout/user-main'})
    try {
        const categories = await Categories.find({ isValid: true })
        const additionalData = categories
        if (!(req.session.user)) {
            res.render('user/signUp', { layout: './layout/user-main', errors: null, additionalData })
        } else {
            res.redirect('/')
        }
    } catch (e) {
        console.log('error in signup load', e.message)
    }



}
//post signUp
const postSignUp = async (req, res) => {
    if (req.session.user) {

        res.redirect('/')

    } else {
        const categories = await Categories.find({ isValid: true })

        const additionalData = categories
        let errors = {}
        let signedUser
        try {
            let { fullName, email, mobileNo, password, repeatPassword } = req.body

            //validate full name
            const nameError = helpers.validateName(fullName)
            if (nameError !== undefined)
                errors.fullName = nameError

            //validate mobile no
            const numError = helpers.validateNo(mobileNo)
            if (numError !== undefined)
                errors.mobileNo = numError

            //validate password 
            const passError = helpers.validatePassword(password)
            if (passError !== undefined) {
                errors.password = passError
            }

            //validate repeat password
            if (password !== repeatPassword) {
                errors.repeat = { message: "Password didn't match" }
            }
            //hash the password 
            const secPassword = await helpers.securePassword(password)

            const newUser = new User({ fullName, email, password: secPassword, mobileNo })
            signedUser = newUser

            if (Object.keys(errors).length > 0) {
                // If there are errors, render the signup page with all validation errors
                console.log(errors)
                res.render('user/signUp', { layout: './layout/user-main', errors, formData: newUser, additionalData });
            } else {
                await newUser.save()
                    .then((data) => {

                        req.session.authenticated = true
                        req.session.user = data
                        req.session.cartQuantity = 0

                        res.redirect('/profile')

                    })
                //res.redirect('/');

            }
        } catch (error) {
            // Handle other errors, e.g., MongoDB connection error
            //email already exists
            if (error.code === 11000) {
                errors.email = { message: 'Email already exists' }
                res.render('user/signUp', { layout: './layout/user-main', errors, formData: signedUser, additionalData });
            }
            else
                res.status(500).send('Internal Server Error');
        }
    }
}
//post logout
const postLogout = (req, res) => {
    req.session.authenticated = false
    req.session.destroy()
    res.redirect('/')
}

//get user management
const getUsers = async (req, res) => {
    let userlist
  
    await users.find().sort({ createdAt: -1 })
      .then((data) => {
  
        userlist = data
        req.session.adminAuthenticate = true
      })
      .catch((err) => {
        console.log(err)
      })
    res.render('admin/users', { layout: './layout/admin-main', userlist: userlist })
  }
  //search user
  const getSearchUser = (req, res) => {
    const query = req.query.searchQuery;
    console.log("q", query);
    try {
      // Find users matching the search query in the database
      users
        .find({
          $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        })
        .then((users) => {
          res.render('admin/users', { layout: './layout/admin-main', userlist: users })
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (error) {
      console.error(error);
    }
  }
  //block user
  const getBlockUnblockUser = async (req, res) => {
    const userId = req.params.id;
    let specifiedUser
    try {
      specifiedUser = await users.findOne({ _id: userId });
    } catch (error) {
      console.log(error.message)
    }
    const isBlockedData = specifiedUser.isBlocked === true ? false : true
  
    await users.updateOne({ _id: userId }, { isBlocked: isBlockedData })
      .then((data) => {
        res.redirect('/admin/users')
        console.log('blocked user')
      })
      .catch((err) => {
        console.log('error in block user', err.message)
      })
  }
  

module.exports={
    getLogin,
    postLogin,
    postOtp,
    postResend,
    getSignUp,
    postSignUp,
    postLogout,

    
  getUsers,
  getSearchUser,
  getBlockUnblockUser,





}