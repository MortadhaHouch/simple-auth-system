let express  = require("express");
let path = require("path");
let app = express();
let dotenv = require("dotenv");
let bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");
let checkUser = require("./middlewares/checkUser");
let jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");
dotenv.config();
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use("/assets", express.static(path.join(__dirname, "/assets")));
let User = require("./models/user")
app.listen(3000,()=>{
    console.log("server running on port 3000");
})
app.get("/",checkUser,(req,res)=>{
    res.render("main");
})
app.get("/login",async (req,res)=>{
    res.render("login");
})
app.post("/login",async (req,res)=>{
    let {email,password} = req.body;
    try {
        let foundUser = await User.findOne({email});
        if(foundUser){
            let foundPassword = await bcrypt.compare(password,foundUser.password);
            if(foundPassword){
                let maxAge=60*60*24*3;
                let token = jwt.sign({email,password},process.env.SECRET_KEY,{expiresIn:maxAge});
                res.cookie("json_token",token,{maxAge:maxAge*1000});
                res.status(200).json({foundUser,foundPassword});
            }else{
                res.status(404).json({message:"Please verify your password"});
            }
        }else{
            res.status(404).json({message:"User not found"});
        }
    } catch (error) {
        console.log(error);
    }
})
app.get("/signup",(req,res)=>{
    res.render("signup");
})
app.post("/signup",async (req,res)=>{
    let {firstName,lastName,email,password} = req.body;
    try {
        let userFoundByEmail = await User.findOne({email});
        if(userFoundByEmail){
            res.json({error:"user already existing"});
        }else{
            if(userFoundByEmail?.firstName == firstName){
                res.json({error:"there is already a user having this name"});
            }else{
                let user = await User.create({firstName,lastName,email,password});
                let maxAge=60*60*24*3;
                let token = jwt.sign({email,password},process.env.SECRET_KEY,{expiresIn:maxAge});
                res.cookie("json_token",token,{maxAge:maxAge*1000,httpOnly:true,secure:true});
            }
        }
    } catch (error) {
        console.log(error);
    }
})
app.get("/data",checkUser,async(req,res)=>{
    res.render("data");
})
app.get("/logout",(req,res)=>{
    res.cookie("json_token","",{maxAge:0});
    res.redirect("/login");
})
app.get("/file_upload",checkUser,(req,res)=>{
    res.render("file_upload");
})
app.get("/:username/profile",checkUser,async (req,res)=>{
    let {username} = req.params;
    let [firstName,lastName] = username.split("_");
    try {
        let userFound = await User.findOne({firstName,lastName});
        res.render("user_details",{
            userFound
        })
    } catch (error) {
        console.log(error.message);
    }
})
app.use((req,res)=>{
    res.render("404")
})