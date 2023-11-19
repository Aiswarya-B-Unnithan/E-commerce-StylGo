
const Products=require('../models/product')
const Categories=require('../models/category')
const User=require('../models/user')
const bcrypt=require('bcrypt')
const helpers=require('../helpers/signIn-signUp')
const Variants=require('../models/variants')
const Order=require('../models/order')
const Cart=require('../models/cart')




const addToCart = async (req, res) => {

    try {
        let userId = req.session.user._id
        let productId = req.body.productId
        let quantity = parseInt(req.body.quantity, 10)
        let { size, color } = req.body
        let productData = `stock_${color}_${size}`
        let stock = req.body[productData]
        console.log('add to cart page ', stock)

        // Find the user's cart
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Find the product
        const product = await Products.findById({ _id: productId });

        if (!product) {
            throw new Error('Product not found');
        }

        // Check if the cart already contains the product
        const existingItem = cart.items.find((item) =>
            item.product.equals(productId) &&
            item.size === size &&
            item.color === color
        );

        if (existingItem) {
            // If the product is already in the cart, update the quantity
            existingItem.quantity += quantity;
            cart.totalQuantity += quantity

        } else {
            // If the product is not in the cart, add it as a new item
            cart.items.push({
                product: productId,
                size,
                color,
                stock,
                quantity: quantity
            });
            cart.totalQuantity += quantity



        }

        // Update the total price in the cart
        cart.totalPrice =  (cart.totalPrice +(product.price * quantity)).toFixed(2);


        // Save the updated cart
        await cart.save();

        req.session.cartQuantity = cart.totalQuantity

        req.flash('success', `${quantity} item added to cart`)
        res.redirect(`/productDetail/${product._id}`)

    } catch (e) {
        console.log('error adding to cart', e)
    }
}


const getCart = async (req, res) => {
    try {

        if (req.session.user) {
            const categories = await Categories.find({ isValid: true })
            const additionalData = categories
            const userCart = await Cart.findOne({ user: req.session.user._id })
            let cartItems
            if (userCart) {
                cartItems = userCart.items
                res.render('user/cart', { layout: './layout/user-main', additionalData, cartItems, userCart })
            } else {
                console.log('No cart items found.');
                let errorMessage = 'No Items in cart'
                res.render('user/cart', { layout: './layout/user-main', additionalData, errorMessage, cartItems })
            }
        } else {
            const script = `<script>
                alert("Please sign in to your account");
                window.history.back();
            </script>`


            res.status(400).send(script);
        }

    } catch (e) {
        console.log('error in cart load : ', e.message)
    }
}


const incrementCartData = async (req, res) => {
    try {
        let { productDetails } = req.params

        let detailsArray = productDetails.split('_')
        let productId = detailsArray[0]
        let color = detailsArray[1]
        let size = detailsArray[2]

        //take product from cart
        let cart = await Cart.findOne({ user: req.session.user._id });
        const existingItem = cart.items.find((item) =>
            item.product.equals(productId) &&
            item.size === size &&
            item.color === color
        );
        console.log('existing item', existingItem)

        if (existingItem.quantity < existingItem.stock) {

            existingItem.quantity++
            req.session.cartQuantity++
            cart.totalQuantity++
            cart.totalPrice += existingItem.product.price;
            await cart.save()

            const newCart = await Cart.findOne({ user: req.session.user._id });

            const updatedItem = newCart.items.find((item) =>
                item.product.equals(productId) &&
                item.size === size &&
                item.color === color
            );
            console.log('new item', updatedItem)
            res.json({ updatedItem, newCart });
        } else {
            // Product is out of stock, send an appropriate response
            res.status(400).json({ message: 'Product is out of stock' });
        }
    } catch (e) {
        console.log('error in cart data increment ', e)
    }
}

//===============decrement cart qnty==============
const decrementCartData = async (req, res) => {
    try {
        let { productDetails } = req.params

        let detailsArray = productDetails.split('_')
        let productId = detailsArray[0]
        let color = detailsArray[1]
        let size = detailsArray[2]

        //take product from cart
        let cart = await Cart.findOne({ user: req.session.user._id });
        const existingItem = cart.items.find((item) =>
            item.product.equals(productId) &&
            item.size === size &&
            item.color === color
        );


        if (existingItem) {

            existingItem.quantity--
            req.session.cartQuantity--
            cart.totalQuantity--
            cart.totalPrice -= existingItem.product.price;
            await cart.save()

            const newCart = await Cart.findOne({ user: req.session.user._id });

            const updatedItem = newCart.items.find((item) =>
                item.product.equals(productId) &&
                item.size === size &&
                item.color === color
            );

            res.json({ updatedItem, newCart });
        } else {
            // Product is out of stock, send an appropriate response
            res.status(400).json({ message: 'no product found' });
        }
    } catch (e) {
        console.log('error in cart data decrement ', e)
    }
}

//==================delete cart item===============
const deleteCartItem = async (req, res) => {
    try {
        let { productDetails } = req.params

        let detailsArray = productDetails.split('_')
        let productId = detailsArray[0]
        let color = detailsArray[1]
        let size = detailsArray[2]

        //take product from cart
        let cart = await Cart.findOne({ user: req.session.user._id });

        const existingItem = cart.items.find((item) =>
            item.product.equals(productId) &&
            item.size === size &&
            item.color === color
        );

        const existingItemIndex = cart.items.findIndex((item) =>
            item.product.equals(productId) &&
            item.size === size &&
            item.color === color
        );

        if (existingItemIndex !== -1) {
            cart.items.splice(existingItemIndex, 1);

            // Update the total price and save the cart
            
            cart.totalPrice -= existingItem.product.price * existingItem.quantity;
            req.session.cartQuantity -= existingItem.quantity
           
            await cart.save();
            if (cart.items.length === 0) {
                // If the cart is empty after removing the item, delete the cart
                await Cart.findByIdAndDelete(cart._id);
                res.json(null); // Send a response indicating that the cart is now empty
            } else {
                const newCart = await Cart.findOne({ user: req.session.user._id });
                res.json(newCart);
            }
            // res.json(newCart);
        } else {

            res.status(400).json({ message: 'no product found' });
        }
    } catch (e) {
        console.log('error in cart data delete ', e)
    }
}

module.exports = {
    getCart,
    addToCart,
    incrementCartData,
    decrementCartData,
    deleteCartItem,


}