const express=require('express')

const app=express()

app.get('/',(req,res)=>{
    res.send('Welocome!.....')
})

app.listen(3001)