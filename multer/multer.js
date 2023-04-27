const multer= require('multer');

const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
  

  const editedStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
 const bannerAdd = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/uploads')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }

 })
 const bannerEdit = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/uploads')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }

 })


module.exports={
    uploads:multer({storage:Storage}).array('Image',4),
    editeduploads:multer({storage:editedStorage}).fields([
        {name:'image1',maxCount:1},
        {name:'image2',maxCount:1},
        {name:'image3',maxCount:1},
        {name:'image4',maxCount:1}
    ]),
    bannerAdd:multer({storage:bannerAdd}).single('bannerImg'),

    
    bannerEdit:multer({storage:bannerEdit}).single('bannerEditImg')

}
