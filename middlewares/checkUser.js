let user = require("../models/user");
let jwt = require("jsonwebtoken");
let dotenv = require("dotenv");
dotenv.config();
async function checkUser(req,res,next){
    try {
        if(!req.cookies.json_token){
            res.locals.user = null;
            res.redirect("/login");
        }else{
            let userData = jwt.verify(req.cookies.json_token,process.env.SECRET_KEY);
            let foundUser = await user.findOne({email:userData.email});
            let userName = `${foundUser.firstName}_${foundUser.lastName}`;
            res.locals.user = userName;
        }
        next()
    } catch (error){
        res.locals.user = null;
    }
}
module.exports = checkUser