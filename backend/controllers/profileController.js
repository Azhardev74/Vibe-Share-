import bcrypt from "bcryptjs";
import User from "../models/user.js";

const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
};

const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user.userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.userName = req.body.userName || user.userName;
    user.email = req.body.email || user.email;
    user.profilePic = req.body.profilePic || user.profilePic;
    user.bio = req.body.bio || user.bio;

    if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, 10);
    }

    await user.save();

    res.json({
        message: "Profile updated",
        user: {
            _id: user._id,
            userName: user.userName,
            email: user.email,
            profilePic: user.profilePic,
            bio: user.bio
        }
    });
};

export { getUserProfile, updateUserProfile };