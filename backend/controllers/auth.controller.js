import User from "../models/User.js"; // import UserSchema
import jwt from "jsonwebtoken";
import {redis} from "../lib/redis.js";

const generateTokens = (userId)=>{ //generateds a access token based on sectet key
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
    await redis.set(`refresh_token:${userId}`,accessToken,"EX",15*60)
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
    res.send("login");
}

export const logout = async (req,res) =>{
    res.send("logout");
}