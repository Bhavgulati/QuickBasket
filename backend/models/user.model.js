import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // to hash the password
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
//timestamps is a second arguemet after fields




//pre save hook to hash passowrd 
//calls a middle function between this and next which checks 
//if the passowrd is modifie or not 
//and if not then salts it and moves on to next
UserSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next();

    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password,salt);
        next()
    }catch(error){
        next(error)
    }
})

UserSchema.methods.comparePassword =  async function  (password) {
    return await bcrypt.compare(password, this.password)
}

const User = mongoose.model("User",UserSchema); // should come after hashing to save the changes
//note learn more about next and this
export default User;
