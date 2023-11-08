const multer=require('multer')
const path=require('path')

const storage=multer.diskStorage({
    // destination:(req,file,cb)=>{
    //     cb(null,path.join(__dirname,'../../public/uploads/'))
    // },
    destination:(req,file,cb)=>{
        //cb(null,'uploads/')
        cb(null,path.join(__dirname,'../public/uploads'))
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'-'+file.originalname)
       
    }
})
const upload=multer({
    storage:storage,
    limits:{fileSize: 5 * 1024 * 1024 }
})

module.exports=upload