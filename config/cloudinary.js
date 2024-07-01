const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//config cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
//instance of cloudinary storage
//const storage = new CloudinaryStorage({...});: Đây là cách tạo ra một đối tượng lưu trữ trên Cloudinary với các tham số như allowedFormats
//(định dạng tệp được phép tải lên), params.folder (tên thư mục lưu trữ) và params.transformation(các tham số chỉnh sửa ảnh).
const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ['png', 'jpg'],
    params: {
        folder: 'blog-api',
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
    }
})
module.exports = storage