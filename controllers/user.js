const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Token = require('../models/Token');
const sendEmail = require('../utilities/sendEmail');

const generateWebToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "7d"});
}
// Register
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
        // secure: true

    });

    if(user){
        const {_id,name,email,phone,photo,bio} = user;
        res.status(200).json({_id,name,email,phone,photo,bio,token});
    }else{
        res.status(400);
        throw new Error('Invalid user data');
    }
});
// Login
const LoginUser = asyncHandler(async (req,res)=>{
    const {email, password} = req.body;
    if(!email || !password){
        res.status(400);
        throw new Error('Please fill in all requires fields');
    }
    // check user if exists
    const user = await User.findOne({email});
    if(!user){
        res.status(400);
        throw new Error('User not found please signup');
    }
    // check password 
    const passwordExists = await bcrypt.compare(password, user.password);
    // Generate token
    const token = generateWebToken(user._id);

    res.cookie("token", token, {
        path:'/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: "none",
        // secure: true
    });
    // check user or password 
    if(user && passwordExists){
        const {_id, name ,email,phone,photo,bio} = user;
        res.status(200).json({_id, name ,email,phone,photo,bio,token});
    }else{
        res.status(400);
        throw new Error('Invalid email & password');
    }
});
// Logout user
const logoutUser = asyncHandler(async (req,res) => {
    res.cookie("token","",{
        path:'/',
        httpOnly:true,
        expires: new Date(0),
        sameSite: 'none',
        secure: true
    });
    res.status(200).json({message:'user logout successfully'});
});
// Logout user
const getUser = asyncHandler(async (req,res) => {
    const user = await User.findById(req.user._id);
    if(user){
        const {_id,name,email,phone,photo,bio} = user;
        res.status(200).json({id:_id,name,email,phone,photo,bio});
    }else{
        res.status(400);
        throw new Error('User not found');
    }
});
// Logout user
const loginStatus = asyncHandler(async (req,res) => {
    const token = req.cookies.token;
    if(!token){
        return res.json(false);
    }
    const verified = await jwt.verify(token, process.env.JWT_SECRET);
    if(verified){
        return res.json(true);
    }
    return res.json(false);
});
// Update user
const updateUser = asyncHandler(async (req,res) => {
    const user = await User.findById(req.user._id);
    if(user){
        const {name,email,phone,bio} = user;
        user.name = req.body.name || name;
        user.email = req.body.email || email;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        const updateData = await user.save();

        res.status(200).json({
            id: updateData._id,
            name: updateData.name,
            email: updateData.email,
            phone: updateData.phone,
            photo: updateData.photo,
            bio: updateData.bio
        });
    }
});
const changePassword = asyncHandler(async (req,res) => {
    const {oldPassword, password} = req.body;
    if(!oldPassword && password){
        res.status(400);
        throw new Error('Please add old Password and new password');
    }
    const user = await User.findById(req.user._id);
    if(!user){
        res.status(400);
        throw new Error('User not found');
    }
    const passwordIfExists = await bcrypt.compare(oldPassword, user.password);
    if(user && passwordIfExists){
        user.password = password;
        user.save();
        res.status(200).json({message:'Password update successfully'});
    }else{
        res.status(400);
        throw new Error('Old password is incorrect');
    }
});
// Forget password 
const forgotPassword = asyncHandler(async (req,res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
        res.status(400);
        throw new Error('User not found');
    }

    // check old and delete
    const token = await Token.findOne({userId:user._id});
    if(token){
        await token.deleteOne();
    }
    //resetToken
    const resetToken = crypto.randomBytes(32).toString('hex') + user._id;
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await new Token({
        userId: user._id,
        token:hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (5 * 1000)
    }).save();

    const resetUrl = `example.com/resetpassword/${resetToken}`;

    // Resend Email
    const message = `
    <h2>Hello ${user.name}</h2>
    <p>Please use the url below to reset your password</p>  
    <p>This reset link is valid for only 30minutes.</p>
    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    <p>Regards...</p>
    <p>Pinvent Team</p>
  `;
    const subject = 'Password Reset Request';
    const send_to = user.email;
    const send_from = process.env.MAILER_USER_MAIL;
    try {
        await sendEmail(subject,message,send_to,send_from);
        res.status(200).json({message:'Reset Email send again'});
    } catch (error) {
        res.status(500);
        throw new Error('Email not send, Please try again');
    }
});
const resetPassword = asyncHandler(async (req,res) => {
    const {token} = req.params;
    const {password} = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: {$gt: Date.now()}
    });
    if(!userToken){
        res.status(404);
        throw new Error('Invalid or Expired reset token');
    }
    const user = await User.findById(userToken.userId);
    user.password = password;
    user.save();
    res.status(200).json({
        message: "Password reset successfully. Please login"
    });
});
module.exports = {RegisterUser,LoginUser,logoutUser,getUser,loginStatus,updateUser,changePassword,forgotPassword,resetPassword};