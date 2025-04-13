import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name:{ // key value pari nkey: {value}
        type:String,
        required: [true,"Name is Required"]
    },
    email:{
        type:String,
        required: [true,"Email is Reuired"],
        unique:true,
        lowercase: true,
        trim:true
    },
    password :{
        type:String,
        required: [true,"password is Required"],
        minlength:[6,"Password must be at least 6 characters long"]
    },
    cartItems:[ //array of objects which have quantity and product object id 
        {
            quantity:{
                type:Number,
                default:1
            },
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product",
                required:true
            }
        }
    ],
    role:{
        type:String,
        enum: ["customer", "admin"],
        default:"customer"
    },
    },
    //createdAt, updatedAt
    {
        timestamps:true,
    }
);

const User = mongoose.model("User",UserSchema);

export default User;
//timestamps is a second arguemet after fields
//{ ... fields}, {timestamps: true}
