const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const date = require('date-and-time');

const {sign} = require("jsonwebtoken");

const {validateToken} = require("../middleware/AuthMiddleware");

const {uploadFile} = require("./S3");

const fs = require("fs");
const utils = require("util")

const unlinkfile = utils.promisify(fs.unlink);

//Register

router.post("/register",  async (req,res)=>{
    const now  =  new Date();   
    const value = date.format(now,'YYYYMMDDHHmmss');

    const dp = req.files.profilepic;
    var path = +"Images/" +value+ dp.name;

    const username = req.body.username;
    const user = await User.findOne({username: username});

    if(!user){
        dp.mv(path, async (err)=>{
            if(err){
                res.json({"status": "File Not Uploaded"})
            }
    
            else{
                const uploadedImg = uploadFile(path, value+ dp.name);
                const salt = await bcrypt.genSalt(10);
                const hashedPass = await bcrypt.hash(req.body.password,salt);
                const newUser = new User({
                    name: req.body.name,
                    username: req.body.username,
                    password: hashedPass,
                    fbid: req.body.fbid,
                    instaid: req.body.instaid,
                    twitterid: req.body.twitterid,
                    youtubeid: req.body.youtubeid,
                    profilepic: "https://sirenblogbucket.s3.ap-south-1.amazonaws.com/"+value+ dp.name
                })
                const addedUser = await newUser.save();
                unlinkfile(path);
                res.json({"status": "Record Successfully Inserted"});
            }
        });
    }
    else{
        res.json({"error": "This Username is already Taken..... Try Something new...."});
    }

});


// Login

router.post("/login", async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const user = await User.findOne({username: username});
    if(!user){
        res.json({"error": "No user found with such username"});
    }
    else{
        bcrypt.compare(password,user.password).then((match)=>{
            if(!match) return res.json({error: "Wrong Credentials"});

            const accesstoken = sign({username: user.username, userid: user._id}, "secretmessage");
            res.json({token: accesstoken, username: user.username, userid: user._id})
        })
    }
})


// Check token

router.get("/verify", validateToken, (req, res)=>{
    res.json(req.user)
})





module.exports= router;