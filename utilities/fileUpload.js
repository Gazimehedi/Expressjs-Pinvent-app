const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, "uploads");
    },
    filename: (req,file,cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname );
    }
});
// function fileFilter(
const upload = multer({storage, fileFilter: (req,file,cb) => {
    if(
        file.mimetype == 'image/jpg' || 
        file.mimetype == 'image/jpeg' || 
        file.mimetype == 'image/png'
    ){
        cb(null, true);
    }else{
        cb(null, false);
    }
}});

module.exports = {upload};