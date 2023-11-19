const Products = require('../models/product')
const Categories = require('../models/category')
const User = require('../models/user')
const Variants = require('../models/variants')
const Cart = require('../models/cart')
const Order = require('../models/order')
const Coupon = require('../models/coupon')
const razorpay = require('../config/razorpay')

const getCheckout = async (req, res) => {
    try {
        const categories = await Categories.find({ isValid: true })
        const additionalData = categories
        let currentUser = await User.findOne({ email: req.session.user.email })
        let cart = await Cart.findOne({ user: req.session.user._id });
        const coupons = await Coupon.find()
        let availableCoupons = []
        coupons.forEach(coupon => {
            if ((new Date(coupon.startDate) <= new Date()) && (new Date() <= new Date(coupon.endDate))) {
                availableCoupons.push(coupon)
            }
        })

       
        res.render('user/checkout', { layout: './layout/user-main', additionalData, currentUser, availableCoupons, cart })

    } catch (e) {
        console.log('error in checkout page', e)
    }
}
const addAddressCheckout = async (req, res) => {
    try {
        let { houseNo, street, city, state, postalcode, country } = req.body
        let currentUser = await User.findOne({ email: req.session.user.email })

        let newAddress = { houseNo, street, city, state, postalcode, country }
        let addresses = [...currentUser.addresses, newAddress]

        const updatedUser = await User.findByIdAndUpdate({ _id: currentUser._id }, { addresses })
        req.session.user = updatedUser
        res.redirect('/checkout')

    } catch (e) {
        console.log('error in add address checkout', e)
    }
}


//=====coupon apply=========
const applyCoupon = async (req, res, next) => {
    try {


        const currentUser = await User.findOne({ email: req.session.user.email })
        const cart = await Cart.findOne({ user: req.session.user._id });
        let couponCode = req.body.couponCode
        const coupon = await Coupon.findOne({ couponCode })
        if (coupon) {
            if ((new Date(coupon.startDate) <= new Date()) && (new Date() <= new Date(coupon.endDate))) {

                // Check if the minimum purchase amount requirement is met
                if (cart.totalPrice >= coupon.minPurchaseAmt) {
                   /* const customerUsedCoupon = await Coupon.findOne({
                        customer: currentUser._id,
                        couponCode,
                    });
                    if (customerUsedCoupon) {
                        req.flash('error', 'Coupon has already been used by you.');
                        res.redirect('/checkout');
                    } else { */
                        let discountAmount = 0;

                        if (coupon.discountType === 'fixed') {
                           
                            discountAmount = coupon.discountValue;
                        } else if (coupon.discountType === 'percentage') {
                            
                            discountAmount = (cart.totalPrice * coupon.discountValue) / 100;
                        }
                        
                        cart.totalPrice -= discountAmount
                        cart.totalPrice = cart.totalPrice.toFixed(2)
                        cart.couponApplied = couponCode
                        cart.couponAmount=discountAmount
                        await cart.save()
                        res.redirect('/checkout');

                    

                } else {
                    req.flash('error', `Minimum purchase amount of ${coupon.minPurchaseAmt} not met.`);
                    res.redirect('/checkout');
                }
            } else {
                req.flash('error', 'Coupon is not valid for the current date.');
                res.redirect('/checkout');
            }



        } else {
            req.flash('error', `Invalid coupon`)
            res.redirect(`/checkout`)
        }

    } catch (e) {
        next(e)
    }
}

const removeCoupon = async (req, res, next) => {
    try {


        const currentUser = await User.findOne({ email: req.session.user.email })
        const cart = await Cart.findOne({ user: req.session.user._id });
        let couponCode = req.body.couponCode
        const coupon = await Coupon.findOne({ couponCode })
        let discountAmount = 0;

        if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discountValue;
        } else if (coupon.discountType === 'percentage') {
            discountAmount = (cart.totalPrice * coupon.discountValue) / 100;
        }

       
        cart.totalPrice += discountAmount
        cart.totalPrice = cart.totalPrice.toFixed(2)
        cart.couponApplied =undefined
        cart.discountAmount=undefined
        await cart.save()
        res.redirect('/checkout');

    } catch (e) {
        next(e)
    }
}
//=======place order================
const placeOrder = async (req, res) => {
    try {
        console.log('inside place order')
        const user = await User.findOne({ email: req.session.user.email })

        let { paymentMethod, totalAmount } = req.body

        let addressParts = (req.body.address).split('_')
        let addressIndex = parseInt(addressParts[1])
        let address = user.addresses[addressIndex]

        let cart = await Cart.findOne({ user: user._id });

        let orderItems = []
        //add item details to order schema 
        cart.items.forEach((item) => {
            orderItems.push({
                product: item.product,
                size: item.size,
                color: item.color,
                quantity: item.quantity
            })
        })

        const newOrder = new Order({
            user: user._id, // The user who placed the order (User ID)
            address, // The selected address details
            paymentMethod, // The selected payment method
            items: orderItems, // Array of product IDs
            totalAmount, // Total price of the order
        });
        // Save the new order to the database
        await newOrder.save();
        const orderId = newOrder._id


        if (paymentMethod == 'razorpay') {
            const options = {
                amount: parseInt(totalAmount) * 100,
                currency: 'INR',
                //receipt:orderId
            };

            razorpay.orders.create(options, (err, order) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to create order' });
                }
                console.log('razorpay order', order)
                res.render('user/razorpayPayment', { layout: false, order, orderId })
            });
        } else if (paymentMethod === 'wallet') {
            if (user.walletTotal >= totalAmount) {
                user.walletTotal -= totalAmount
                let walletData = {
                    transactionType: 'Debited',
                    amount: totalAmount
                }
                user.wallets = [...user.wallets, walletData]
                await user.save()
                req.session.user = user
                res.redirect(`/afterPlaceOrder/${orderId}`)
            } else {
                req.flash('walletError', `Wallet have not enough balance.`);
                res.redirect('/checkout');

            }
        }
        else {
            res.redirect(`/afterPlaceOrder/${orderId}`)
        }
    } catch (e) {
        console.log('error place order', e)
    }
}

const afterPlaceOrder = async (req, res, next) => {
    try {
        console.log('enter after palce order')
        let orderId = req.params.orderId

        const categories = await Categories.find({ isValid: true })
        const additionalData = categories
        const user = await User.findOne({ email: req.session.user.email })
        const order = await Order.findOne({ _id: orderId })
        let cart = await Cart.findOne({ user: user._id });

        //update database for each product
        cart.items.forEach(async (item) => {
            let originalProduct = await Products.findOne({ _id: item.product._id })
            let variantData = originalProduct.variants.find((variant) => variant.color === item.color)
            let variantToUpdate = await Variants.findOne({ _id: variantData._id })



            if (originalProduct.stock === item.quantity) {
                console.log('same stock as pdt stock ')
                //delete the product and also the variant
                originalProduct.isValid = false
                originalProduct.variants = [];
                await Variants.deleteOne({ _id: variantData._id })
                await originalProduct.save()
                console.log('original after update stock', originalProduct)

            } else {
                variantToUpdate.sizes.forEach((sizeObj, index) => {
                    if (sizeObj.size === item.size) {
                        if (sizeObj.quantity === item.quantity) {
                            variantToUpdate.sizes.splice(index, 1);
                        } else {
                            sizeObj.quantity -= item.quantity
                        }
                    }
                })
                await variantToUpdate.save()
                await originalProduct.save()
            }


        })
        //update coupon data

        const couponCode = cart.couponApplied
        if (couponCode) {
            const coupon = await Coupon.findOne({ couponCode })
            coupon.customer.push(user._id)
            await coupon.save()
        }

        //delete cart data

        await Cart.deleteOne({ _id: cart._id });
        req.session.cartQuantity = 0
        let userOrders = [...user.orders, orderId]
        user.orders = userOrders
        await user.save()
        req.session.user = user

        //update order ststus
        if ((order.paymentMethod === 'razorpay') || (order.paymentMethod === 'wallet')) {
            order.status = 'Success'
            await order.save()
        }
        res.render('user/orderSuccess', { layout: './layout/user-main', additionalData })
    } catch (e) {
        next(e)
    }

}
const afterPlaceOrderFail = async (req, res, next) => {
    try {
        console.log('enter after palce order fail')
        let orderId = req.params.orderId
        const order = await Order.findOne({ _id: orderId })
        const user = await User.findOne({ email: req.session.user.email })

        order.status = 'Failed'
        await order.save()

        let userOrders = [...user.orders, orderId]
        user.orders = userOrders
        await user.save()
        req.session.user = user

        const categories = await Categories.find({ isValid: true })
        const additionalData = categories
        res.render('user/orderFail', { layout: './layout/user-main', additionalData })


    } catch (e) {
        next(e)
    }

}

module.exports = {
    placeOrder,
    getCheckout,
    applyCoupon,
    addAddressCheckout,
    afterPlaceOrder,
    afterPlaceOrderFail,
    removeCoupon


}
