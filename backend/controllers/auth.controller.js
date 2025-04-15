import User from "../models/User.js"; // import UserSchema


export const signup = async (req,res) =>{
    try{
        const {email,password,name} = req.body;
        const userExist = await User.findOne({email});

        if(userExist){
            return res.status(400).json({message:"User already exist"});
        }
        const user = await User.create({name,email,password})
        res.status(201).json({message:"User Created Successfully"})
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