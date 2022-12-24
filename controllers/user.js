const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateWebToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "7d"});
}
const RegisterUser = asyncHandler( async (req,res) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password){
        res.status(400);
        throw new Error('Please fill in all required fields');
    } 
    if(password.length < 6){
        res.status(400);
        throw new Error('Password must be up to 6 characters');
    } 

    const userExists = await User.findOne({email});
    if(userExists){
        res.status(400);
        throw new Error('Email has already been registered');
    }

    const user = await User.create({name,email,password});

    const token = generateWebToken(user._id);

    res.cookie("token", token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: "none",
        secure: true

    });

    if(user){
        const {_id,name,email,phone,photo,bio} = user;
        res.status(200).json({_id,name,email,phone,photo,bio,token});
    }else{
        res.status(400);
        throw new Error('Invalid user data');
    }
});

module.exports = {RegisterUser};