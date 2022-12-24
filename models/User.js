const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add name']
        },
        email: {
            type: String,
            required: [true, 'Please add email'],
            unique: true,
            trim: true,
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                "Please enter a valid email",
              ],
        },
        password: {
            type: String,
            required: [true, 'Please add password'],
            minLength: [6, 'Password must be up to 6 characters']
        },
        photo: {
            type: String,
            required: [true, 'Please add photo'],
            default: "https://i.ibb.co/4pDNDk1/avatar.png"
        },
        phone: {
            type: String,
            default: "+880"
        },
        bio: {
            type: String,
            maxLength: [250, 'Bio must not be more than 250 characters'],
            default: "bio"
        }
    },
    {timestemps: true, versionKey: false}
);

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(this.password, salt);
    this.password = hashed;
    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;