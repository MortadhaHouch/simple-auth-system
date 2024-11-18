let {model,Schema} = require("mongoose");
let bcrypt = require("bcrypt");
let dotenv = require("dotenv");
let client = require("../database/database")
dotenv.config();
let User = new Schema({
    firstName:{
        type:String,
        required:true,
        unique:true
    },
    lastName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    }
})
User.pre("save",async function(){
    try {
        let salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        console.log(error);
    }
})
module.exports = model("User",User);