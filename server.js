const express=require('express')
const expressLayouts=require('express-ejs-layouts')
const path=require('path')
const connectDB=require('./config/database')
const session=require('express-session')
//const nocache=require('nocache')
const flash=require('express-flash')
//const cors=require('cors')
const bodyParser = require('body-parser');

const userRoutes=require('./routes/userRoutes')
const adminRoutes=require('./routes/adminRoutes')
const errorMiddleware=require('./middlewares/errorHandling')
const PORT=process.env.PORT||3002

//creae express app
const app=express()

//use layouts middleware
app.use(expressLayouts)

//parsing
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(bodyParser.urlencoded({ extended: true }));

//set view engine
app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'public')))

//for flash messages
app.use(flash())

//db connecection
connectDB();


app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
}))

//to get session data
app.use((req,res,next)=>{
    res.locals.session=req.session
    next()
})

//routes
app.use('/',userRoutes)
app.use('/admin',adminRoutes)

//error handling by global error handling middleware
app.use(errorMiddleware)

//listen to port
app.listen(PORT,()=>{
    console.log(`App is running on url http://localhost:${PORT}`)
})