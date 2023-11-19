const Orders=require('../models/order')
const Products=require('../models/product')
const Categories=require('../models/category')
const SubCategories=require('../models/subCategory')


//sales report
const getSalesReport=async(req,res,next)=>{
    try{
     
      const orders = await Orders.find();
      let productQuantities = {};
  
      // Calculate product quantities
      orders.forEach((order) => {
        order.items.forEach((item) => {
          const productId = item.product._id;
          const quantity = item.quantity;
  
          if (productQuantities[productId]) {
            productQuantities[productId] += quantity;
          } else {
            productQuantities[productId] = quantity;
          }
        });
      });
      
  
      // Get top selling product IDs
      const topSellingProductIds = Object.keys(productQuantities)
        .sort(
          (productIdA, productIdB) =>
            productQuantities[productIdB] - productQuantities[productIdA]
        )
        .slice(0, 10);
  
      // Fetch top selling product details
      const topSellingProductsDetails = await Products.find({
        _id: { $in: topSellingProductIds },
      });
  
      // Extract product names and quantities for Chart.js
      const topSellingProductNames = topSellingProductsDetails.map(
        (product) => product.name
      );
      const topSellingProductQuantities = topSellingProductIds.map(
        (productId) => productQuantities[productId]
      );
      res.json({
        productNames: topSellingProductNames,
        productQuantities: topSellingProductQuantities,
      });
  
    }catch(e){
      next(e)
    }
  }
  //=================salesreport data================
  const getSalesReportData=async(req,res,next)=>{
    try{
     
  const{start_date,end_date,report_type}=req.body
  const page = parseInt(req.query.page) || 1;
        const perPage = 10;
        const skip = (page - 1) * perPage;

      const totalSalesData = await Orders.find({
        status: 'Success'
      })

      let salesData = await Orders.find({
        status: 'Success'
      }).sort({orderDate:-1})
      .skip(skip)
      .limit(perPage)

      let totalPages = Math.ceil( totalSalesData.length / perPage);

      let totalSales=0

      if(start_date&&end_date){
        salesData=salesData.filter(data=>(new Date(data.orderDate) >=new Date(start_date) )&& (new Date(end_date) >=new
        Date(data.orderDate) ) ) 
        totalPages=salesData.length
      }

     
      //total sales
      salesData.forEach(data=>{
        data.items.forEach(item=>{
          
          totalSales+=(item.quantity*item.product.price)
        })
      })

      let categories=await Categories.find({isValid:true})
      let subCategories=await SubCategories.find({isValid:true})
      let products=await Products.find({isValid:true})
      
      let categorySalesData=[]
      //categories data
      categories.forEach(categoryOne=>{
        let categoryName=categoryOne.name
        let totalSales=0
        let totalProducts=0
       
        salesData.forEach(singleSale=>{
          singleSale.items.forEach(item=>{
           if( item.product.category.name===categoryOne.name){
            totalProducts+=item.quantity
            totalSales+=(item.quantity*item.product.price)
  
           }
          })
        })
        categorySalesData.push({categoryName,totalSales,totalProducts})
  
      })
  
      let subCategorySalesData=[]
      //categories data
      subCategories.forEach(subCategoryOne=>{
        let subCategoryName=subCategoryOne.name
        let totalSales=0
        let totalProducts=0
       
        salesData.forEach(singleSale=>{
          singleSale.items.forEach(item=>{
           if( item.product.subCategory.name===subCategoryOne.name){
            totalProducts+=item.quantity
            totalSales+=(item.quantity*item.product.price)
  
           }
          })
        })
        subCategorySalesData.push({subCategoryName,totalSales,totalProducts})
  
      })
  
      let productSalesData=[]
      products.forEach(pdt=>{
        let productName=pdt.name
        let totalSales=0
        let totalProducts=0
       
        salesData.forEach(singleSale=>{
          singleSale.items.forEach(item=>{
           if( item.product.name===pdt.name){
            totalProducts+=item.quantity
            totalSales+=(item.quantity*item.product.price)
  
           }
          })
        })
        productSalesData.push({productName,totalProducts,totalSales})
      })
  categorySalesData=categorySalesData.filter(data=>data.totalSales!==0)
  subCategorySalesData=subCategorySalesData.filter(data=>data.totalSales!==0)
  productSalesData=productSalesData.filter(data=>data.totalSales!==0)

 
  console.log(productSalesData)
      res.render('admin/salesReport', { layout: './layout/admin-main', salesData,totalSales,categorySalesData,subCategorySalesData,start_date,end_date,report_type,productSalesData,totalPages,currentPage:page})
  
    }catch(e){
      next(e)
    }
  }
  
  const postSalesReportData=async(req,res,next)=>{
    try{
     
  const{start_date,end_date,report_type}=req.body
  console.log('req.body',req.body)
  
      const salesData = await Orders.find({
        status: 'Success'
      });
      let totalSales=0
      //total sales
      salesData.forEach(data=>{
        data.items.forEach(item=>{
          
          totalSales+=(item.quantity*item.product.price)
        })
      })
      let categories=await Categories.find({isValid:true})
      let subCategories=await SubCategories.find({isValid:true})
      let products=await Products.find({isValid:true})
      
      let categorySalesData=[]
      //categories data
      categories.forEach(categoryOne=>{
        let categoryName=categoryOne.name
        let totalSales=0
        let totalProducts=0
       
        salesData.forEach(singleSale=>{
          singleSale.items.forEach(item=>{
           if( item.product.category.name===categoryOne.name){
            totalProducts+=item.quantity
            totalSales+=(item.quantity*item.product.price)
  
           }
          })
        })
        categorySalesData.push({categoryName,totalSales,totalProducts})
  
      })
  
      let subCategorySalesData=[]
      //categories data
      subCategories.forEach(subCategoryOne=>{
        let subCategoryName=subCategoryOne.name
        let totalSales=0
        let totalProducts=0
       
        salesData.forEach(singleSale=>{
          singleSale.items.forEach(item=>{
           if( item.product.subCategory.name===subCategoryOne.name){
            totalProducts+=item.quantity
            totalSales+=(item.quantity*item.product.price)
  
           }
          })
        })
        subCategorySalesData.push({subCategoryName,totalSales,totalProducts})
  
      })
  
      let productSalesData=[]
      products.forEach(pdt=>{
        let productName=pdt.name
        let totalSales=0
        let totalProducts=0
       
        salesData.forEach(singleSale=>{
          singleSale.items.forEach(item=>{
           if( item.product.name===pdt.name){
            totalProducts+=item.quantity
            totalSales+=(item.quantity*item.product.price)
  
           }
          })
        })
        productSalesData.push({productName,totalProducts,totalSales})
      })
  categorySalesData=categorySalesData.filter(data=>data.totalSales!==0)
  subCategorySalesData=subCategorySalesData.filter(data=>data.totalSales!==0)
  productSalesData=productSalesData.filter(data=>data.totalSales!==0)
  console.log('ppppp',productSalesData)
  let categorySalesTotal=22;
  let subCategorySalesTotal=88
  let productSalesTotal=77
      res.render('admin/salesReport', { layout: './layout/admin-main', salesData,totalSales,categorySalesData,subCategorySalesData,start_date,end_date,report_type,productSalesTotal,categorySalesTotal,subCategorySalesTotal,productSalesData})
  
    }catch(e){
      next(e)
    }
  }
  
  const getSalesReportForLineGraph= async (req, res) => {
    try {
      const orders = await Orders.find();
      const products = await Products.find().sort({stock:-1}).limit(10);
      const categories = await Categories.find();
  
      // Extract product names and quantities for Chart.js
      const productNames = products.map(
        (product) => product.name
      );
      const productStock= products.map(
        (product) => product.stock
      );
  
      const productCategories = {};
  
      products.forEach((product) => {
        productCategories[product._id.toString()] = {
          categoryId: product.category.toString(),
          productName: product.name,
        };
      });
  
      const categoryNames = {};
      categories.forEach((category) => {
        categoryNames[category._id.toString()] = category.name;
      });
  
      const data2 = {
        orders: orders,
        productCategories: productCategories,
        categoryNames: categoryNames,
        products
      };
      const data={
        productNames,productStock
      }
  
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "An error occurred while fetching data" });
    }
  }
  
  module.exports={
    getSalesReport,
  getSalesReportForLineGraph,
  getSalesReportData,
  }