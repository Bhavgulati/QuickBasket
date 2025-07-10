import User from "../models/user.model.js"; // import UserSchema
import jwt from "jsonwebtoken";
import {redis} from "../lib/redis.js";

export const ping = (req,res)=>{
    console.log("Pinged");
    return res.json({message:"Ping"});
}
const generateTokens = (userId)=>{ //generates a access token based on sectet key
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:'15m'
    });
    const refreshToken = jwt.sign({userId},process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:"7d",
    })
    return {accessToken,refreshToken};
}

const storeRefreshToken = async(userId,refreshToken)=>{
    await redis.set(`refresh_token:${userId}`,refreshToken,"EX",7*24*60*60); 
} //stores the key in refresh_token set with user Id key


const storeAccessToken = async(userId,accessToken)=>{
    await redis.set(`access_token:${userId}`,accessToken,"EX",15*60)
}

const setCookies = (res,accessToken,refreshToken)=>{
    res.cookie("accessToken",accessToken,{
        httpOnly:true, //prevents XSS attacks
        secure:process.env.NODE_ENV === "production",
        sameSite:"strict", //prevents Cross site request forgery
        maxAge:15*60*1000, //needs the millisecond format
    })
    res.cookie("refreshToken",refreshToken,{
        httpOnly:true, //prevents XSS attacks
        secure:process.env.NODE_ENV === "production",
        sameSite:"strict", //prevents Cross site request forgery
        maxAge:7*24*60*60*1000,
    })
}
export const signup = async (req,res) =>{
    try{
        const {email,password,name} = req.body;
        const userExist = await User.findOne({email});

        if(userExist){
            return res.status(400).json({message:"User already exist"});
        }
        const user = await User.create({name,email,password})
        //autentication using cookies
        const {accessToken,refreshToken} = generateTokens(user._id);
        //value stored in schema will be aaccessed with key,
        //id key is _id
        await storeRefreshToken(user._id,refreshToken);

        setCookies(res,accessToken,refreshToken);
        res.status(201).json({ user:{
            _id:user._id,
            name: user.name,
            email:user.email,
            role:user.role
        },message:"User Created Successfully"});
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

export const login = async (req,res) =>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email});

        if(user && (await user.comparePassword(password))){
            const {accessToken  , refreshToken} = generateTokens(user._id)

            await storeRefreshToken(user._id,refreshToken);
            setCookies(res,accessToken,refreshToken)
            
            res.json({
                _id:user._id,
                name: user.name,
                email:user.email,
                role:user.role               
            });
        }else{
            return res.status(401).json({message: "Invalid email or password"});
        }
    }catch(error){
        console.log("Error in login contoller",error.message);
        return res.status(500).json({messgage:"Server Error"},{error : error.message});
    }
}
//to logout get the toke nfrom cookie , delete the decoded value
export const logout = async (req,res) =>{
    try{
        const refreshToken = req.cookies.refreshToken; // access refresh Token from cooke
        if(refreshToken){
           const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET); //decodes
           await redis.del(`refresh_token:${decoded.userId}`)    //searchs for the key in redis
        }
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({message: "Logged Out successfully"});
    }catch(error){
        res.status(500).json({message:"Server error",error: error.message});
    }
}

//this will recreate a access token
export const refreshToken= async(req,res)=>{
    try{
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken){
            return res.status(401).json({message: "No refresh token provided"});

        }
        const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

        if(storedToken !== refreshToken){
            return res.status(401).json({message:"Invalid refresh token"});
        }

        const accessToken = jwt.sign({userId:decoded.userId},process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:"15m"
        });
        
        res.cookie("accessToken",accessToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"strict",
            maxAge:15*60*1000,
        })

        return res.json({message:"Access token refreshed successfully"});
    }catch{
        return res.status(500).json({message:"Server error"});
    }
}