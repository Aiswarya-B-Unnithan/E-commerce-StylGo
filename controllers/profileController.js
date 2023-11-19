const Products=require('../models/product')
const Categories=require('../models/category')
const User=require('../models/user')
const bcrypt=require('bcrypt')
const helpers=require('../helpers/signIn-signUp')
const Variants=require('../models/variants')
const Order=require('../models/order')

//==================Profile page==========
const getProfile = async (req, res) => {

    try {
        const categories = await Categories.find({ isValid: true })
        const additionalData = categories
        let error
        let currentUser = await User.findOne({ email: req.session.user.email }).populate({
            path: 'orders',
            options: { sort: { orderDate: -1 } }, // Sorting 'orders' by 'createdAt' in descending order
        })
        res.render('user/profile', { layout: './layout/user-main', currentUser, additionalData, error })
    } catch (e) {
        console.log('Error in getting profile page', e)
    }

}
const editProfile = async (req, res) => {
    try {
        let currentUser = await User.findOne({ email: req.session.user.email })
        const { fullName, email, mobileNo } = req.body

        const updatedUser = await User.findByIdAndUpdate(
            currentUser._id,
            { fullName, email, mobileNo },
            { new: true } // To get the updated document
        );
        console.log('updated user', updatedUser)
        req.session.user = updatedUser

        res.redirect('/profile')

    } catch (e) {
        console.log('Error while edit user profile', e.message)
    }
}
//=======change password==========
const changePassword = async (req, res) => {
    try {
        const user = req.session.user
        let { currentPassword, newPassword, confirmPassword } = req.body
        const categories = await Categories.find({ isValid: true })
        const additionalData = categories

        const isMatchPassword = await bcrypt.compare(currentPassword, user.password)
        const isUnblocked = !(user.isBlocked)

        if (isMatchPassword) {
            //if username ,password match check if blocked or not
            if (isUnblocked) {
                //validate password 
                const passError = helpers.validatePassword(newPassword)
                if (passError !== undefined) {
                    res.render('user/profile', { layout: './layout/user-main', error: { message: 'password is not strong' }, currentUser: user, additionalData })
                    return
                }

                //validate repeat password
                if (newPassword !== confirmPassword) {
                    res.render('user/profile', { layout: './layout/user-main', error: { message: "Password didn't match" }, currentUser: user, additionalData })
                    return
                }
                //hash the password 
                const secPassword = await helpers.securePassword(newPassword)
                let userId = user._id
                await User.findByIdAndUpdate(userId, { password: secPassword });
                const updatedUser = await User.findById(userId);

                req.session.user = updatedUser
                req.flash('success', 'Password successfully changed')
                res.redirect('/profile')



            } else {
                res.render('user/login', { layout: './layout/user-main', error: { message: 'Account blocked by the admin' }, additionalData })
                return
            }
        } else {
            res.render('user/profile', { layout: './layout/user-main', error: { message: "current password didn't match" }, currentUser: user, additionalData })
        }

    } catch (e) {
        console.log('error in change password', e)
    }
}
//==============Add profile image===========
const addProfileImage = async (req, res) => {
   
    try {
        let image = req.file
        let imageUrl = `/uploads/${image.filename}`
        let currentUser = await User.findOne({ email: req.session.user.email })
        currentUser.profileImage = imageUrl
        await currentUser.save()
        let updatedUser = await User.findOne({ email: req.session.user.email })
        req.session.user = updatedUser

        res.redirect('/profile')

    } catch (e) {
        console.log('Error in adding profilre image', e.message)
    }
}
//===================Address===========
const addAddress = async (req, res) => {

    try {
        let { houseNo, street, city, state, postalcode, country } = req.body
        let currentUser = await User.findOne({ email: req.session.user.email })

        let newAddress = { houseNo, street, city, state, postalcode, country }
        let addresses = [...currentUser.addresses, newAddress]

        const updatedUser = await User.findByIdAndUpdate({ _id: currentUser._id }, { addresses })
        req.session.user = updatedUser
        res.redirect('/profile')

    } catch (e) {
        console.log('error in adding address : ', e.message)
    }
}
//=================Edit address==============
const editAddress = async (req, res) => {
    try {
        const user = req.session.user
        let addressIndex = parseInt(req.params.index)
        let address = user.addresses[addressIndex]
        const categories = await Categories.find({ isValid: true })
        const additionalData = categories
        res.render('user/editAddress', { layout: './layout/user-main', address, addressIndex, additionalData })
    } catch (e) {
        console.log('error in edit address page load ', e)
    }
}
const postEditAddress = async (req, res) => {
    try {
        const user = req.session.user
        let addressIndex = parseInt(req.params.index)
        let { houseNo, street, city, state, postalcode, country } = req.body
        let newAddress = { houseNo, street, city, state, postalcode, country }
        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            {
                $set: {
                    [`addresses.${addressIndex}`]: newAddress
                }
            },
            { new: true } // To get the updated document back
        );
        req.session.user = updatedUser
        res.redirect('/profile')


    } catch (e) {
        console.log('error in post edit address', e)
    }
}

const orderAction = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const action = req.body.action
        let order = await Order.findOne({ _id: orderId })
        const user = await User.findOne({ email: req.session.user.email })

        if (action == 'cancel') {

            order.items.forEach(async item => {

                let singlePdt = item.product
                let productToUpdate = await Products.findOne({ _id: singlePdt._id })

                if (productToUpdate.isValid) { //if the product already exists

                    let variantToUpdate = await Variants.findOne({ productId: singlePdt._id, color: item.color })

                    if (variantToUpdate) {
                        let updated = false
                        //check for size if yes add quantity 
                        variantToUpdate.sizes.forEach(async sizeObj => {
                            if (sizeObj.size === item.size) {
                                sizeObj.quantity += item.quantity

                                updated = true

                            }
                        })
                        //if no size add size obj
                        if (updated === false) {
                            //add size obj
                            variantToUpdate.sizes.push({ size: item.size, quantity: item.quantity })

                        }
                        await variantToUpdate.save()
                    } else {
                        //add variant
                        const newVariant = new Variants({
                            productId: singlePdt._id,
                            color: item.color,

                            sizes: [
                                { size: item.size, quantity: item.quantity },
                            ]
                        });

                        await newVariant.save()
                        productToUpdate.variants = [...productToUpdate.variants, newVariant._id]
                        await variantToUpdate.save()
                    }
                } else { // if not valid change status

                    //add variant
                    const newVariant = new Variants({
                        productId: singlePdt._id,
                        color: item.color,

                        sizes: [
                            { size: item.size, quantity: item.quantity },
                        ]
                    });

                    await newVariant.save()

                    //change valid staus
                    productToUpdate.isValid = true
                    productToUpdate.variants = [...productToUpdate.variants, newVariant._id]
                    await productToUpdate.save()


                }

            })

            order.status = 'cancelled'
            await order.save()

            //refund amount to wallet
            if(order.paymentMethod!=='cash on delivery'){
                let walletData = {
                    transactionType: 'Credicted',
                    amount: order.totalAmount,
                    orderId:order._id
                }
                
                user.wallets = [...user.wallets, walletData]
    
                user.walletTotal += order.totalAmount
                await user.save()
               

            }
           

        } else if (action == 'return') {

            order.status = 'return'
            await order.save()
        }

        res.redirect('/profile')

    } catch (er) {
        next(er)
    }
}
module.exports={

    
    getProfile,
    editProfile,
    changePassword,
    addProfileImage,
    addAddress,
    editAddress,
    postEditAddress,
    orderAction
}