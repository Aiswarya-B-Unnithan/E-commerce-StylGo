const Orders=require('../models/order')


//================orders==============
const getOrders = async (req, res,next) => {
try{


  const page = parseInt(req.query.page) || 1;
        const perPage = 6;
        const skip = (page - 1) * perPage;

    const data=await Orders.find()
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(perPage)
      const totalDta=await Orders.find()

      let totalPages = Math.ceil( totalDta.length / perPage);
      
      res.render('admin/order', { layout: './layout/admin-main', orders: data,totalPages,currentPage:page })
    }catch(e){
      next(e)
    }
  
  }
  
  const editOrderStatus = async (req, res) => {
    console.log('inside order edit')
    try {
      const orderId = req.params.orderId;
      const newStatus = req.body.newStatus;
  
      // Find the order by ID
      const order = await Orders.findById(orderId);
  
      if (!order) {
        return res.status(404).send('Order not found');
      }
  
      // Update the status
      order.status = newStatus;
      await order.save();
  
      // Redirect or respond with a success message
      res.redirect('/admin/orders'); // Redirect to the orders page
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
  //=====================search order
  const getSearchOrder = async (req, res) => {
  
    const query = req.query.searchQuery;
    console.log("q", query);
  
    await Orders.findOne({ _id: query })
      .then((data) => {
        console.log('serach order data to see', data
        )
        res.render('admin/order', { layout: './layout/admin-main', orders: data,totalPages:0 })
  
      })
      .catch((err) => {
        console.log('error for search category', err)
      })
  
  
  
  }
  
module.exports = {
    getOrders,
    editOrderStatus,
    getSearchOrder,
  }