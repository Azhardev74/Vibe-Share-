import bcrypt from "bcryptjs";
import User from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import Post from "../models/post.js";

const getUserProfile = async (req, res) => {
    try {
        const loggedInUserId = req.user.userId;
        const { userId } = req.params;

        // if no param → show own profile
        const targetUserId = userId || loggedInUserId;

        // 🔥 get profile user
        const user = await User.findById(targetUserId)
            .select("userName profilePic bio followers following");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 🔥 get posts of that user
        const posts = await Post.find({ user: targetUserId })
            .sort({ createdAt: -1 })
            .select("image likes comments");

        res.status(200).json({
            user,
            posts,
            isOwnProfile: targetUserId === loggedInUserId,
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching profile",
            error: error.message
        });
    }
};


const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        let imageUrl = user.profilePic

        if (req.file && req.file.buffer) {
            try {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "profiles" },
                        (error, result) => {
                            if (error) reject(error)
                            else resolve(result)
                        }
                    )
                    streamifier.createReadStream(req.file.buffer).pipe(stream)
                })

                imageUrl = result.secure_url

            } catch (err) {
                console.error("Cloudinary Error:", err)
            }
        }

        // ✅ UPDATE FIELDS
        user.userName = req.body.userName || user.userName
        user.email = req.body.email || user.email
        user.bio = req.body.bio || user.bio
        user.profilePic = imageUrl

        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10)
        }

        await user.save()

        res.json({
            message: "Profile updated",
            user: {
                _id: user._id,
                userName: user.userName,
                email: user.email,
                profilePic: user.profilePic,
                bio: user.bio
            }
        })

    } catch (error) {
        res.status(500).json({
            message: "Error updating profile",
            error: error.message
        })
    }
}

export { getUserProfile, updateUserProfile };