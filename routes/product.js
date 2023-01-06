const express = require('express');
const {upload} = require('../utilities/fileUpload');
const router = express.Router();
const products = require('../controllers/product');
const protect = require('../middlewares/auth');

router.post('/create-product', protect, upload.single("image"), products.ProductCreate);
router.patch('/update-product/:id', protect, upload.single("image"), products.ProductUpdate);
router.get('/products', protect, products.getProducts);
router.get('/product/:id', protect, products.getProduct);
router.delete('/delete-product/:id', protect, products.DeleteProduct);
module.exports = router;