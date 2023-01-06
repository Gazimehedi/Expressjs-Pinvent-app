const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
exports.ProductCreate = asyncHandler(async (req,res) =>{
    const {name, sku, category, quantity, price,description} = req.body;
    if(!name || !sku || !category || !quantity || !price || !description){
        res.status(400);
        throw new Error('Please fill in all required fileds');
    }
    let fileData = {}
    if(req.file){
        fileData = {
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size
        }
    }
    const product = await Product.create({
        user: req.user.id,
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image: fileData
    });
    res.status(200).json(product);
});
exports.ProductUpdate = asyncHandler(async (req,res) =>{
    const {name, category, quantity, price,description} = req.body;
    const {id} = req.params;
    if(!name || !category || !quantity || !price || !description){
        res.status(400);
        throw new Error('Please fill in all required fileds');
    }
    const product = await Product.findById(id);
    if(!product){
        res.status(404);
        throw new Error('Product not found');
    }
    if(product.user.toString() != req.user.id){
        res.status(401);
        throw new Error('User not authorized');
    }
    let fileData = {}
    if(req.file){
        fileData = {
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size
        }
    }
    const updateProduct = await Product.findByIdAndUpdate(
        {_id:id},
        {
        name,
        category,
        quantity,
        price,
        description,
        image: Object.keys(fileData).length === 0? product?.image : fileData
    },
    {
        new: true,
        runValidators: true
    }
    );
    res.status(200).json(updateProduct);
});
exports.ProductUpdate = asyncHandler(async (req,res) =>{
    const {name, category, quantity, price,description} = req.body;
    const {id} = req.params;
    if(!name || !category || !quantity || !price || !description){
        res.status(400);
        throw new Error('Please fill in all required fileds');
    }
    const product = await Product.findById(id);
    if(!product){
        res.status(404);
        throw new Error('Product not found');
    }
    if(product.user.toString() != req.user.id){
        res.status(401);
        throw new Error('User not authorized');
    }
    let fileData = {}
    if(req.file){
        fileData = {
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size
        }
    }
    const updateProduct = await Product.findByIdAndUpdate(
        {_id:id},
        {
        name,
        category,
        quantity,
        price,
        description,
        image: Object.keys(fileData).length === 0? product?.image : fileData
    },
    {
        new: true,
        runValidators: true
    }
    );
    res.status(200).json(updateProduct);
});
exports.getProducts = asyncHandler(async (req,res) =>{
    const products = await Product.find({user: req.user.id}).sort("-createdAt");
    res.status(200).json(products);
});
exports.getProduct = asyncHandler(async (req,res) =>{
    const {id} = req.params;
    const product = await Product.findById(id);
    if(!product){
        res.status(404);
        throw new Error('Product not found');
    }
    if(product.user.toString() != req.user.id){
        res.status(401);
        throw new Error('user not authorized');
    }
    res.status(200).json(product);
});
exports.DeleteProduct = asyncHandler(async (req,res) =>{
    const {id} = req.params;
    const product = await Product.findById(id);
    if(!product){
        res.status(404);
        throw new Error('Product not found');
    }
    if(product.user.toString() != req.user.id){
        res.status(401);
        throw new Error('user not authorized');
    }
    await product.remove();
    res.status(200).json({message: 'product deleted successfully'});
});
