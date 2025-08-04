const jwt = require("jsonwebtoken");
// const User = require("../models/User.model");

const verifyToken = (req,res,next) => { 
    try{
        let authHeader = req.headers.authorization || req.headers.Authorization;
        if(!authHeader){
            return res.status(401).json({message:"Unauthorized"});
        }
        const token = authHeader.split(" ")[1];
        if(!token) return res.status(401).json({message:"Unauthorized"});
    
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
    
        if(!decoded){
            return res.status(401).json({message:"Unauthorized"});
        }
        req.user = decoded;
        next();
    }
    catch(err){
        res.status(500).json({message:`Error in verifying token ${err.message}`});
        console.log(err);
    }
}


module.exports = {verifyToken};


