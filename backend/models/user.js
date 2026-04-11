import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        required: [true, "Please Enter Username"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "Please Enter Email"],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Enter Correct Password"]
    },
    profilePic: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ""
    },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

},
    { timestamps: true });


const User = mongoose.model("User", userSchema)
export default User;