import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import Post from "../models/post.js";

const postsController = async (req, res) => {
    try {
        const { title, caption } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Title is required"
            })
        }

        let imageUrl = "";
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "posts" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    })
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            })
            imageUrl = result.secure_url;

        }
        // Create and save the post in the database
        const newPost = new Post({
            user: req.user.userId,
            title,
            image: imageUrl,
            caption,
        });
        await newPost.save();
        res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating post",
            error: error.message
        });
    }
};

const getPostsController = async (req, res) => {
    try {
        // console.log()
        const posts = await Post.find({ user: req.user.userId }).populate("user", "userName profilePic");
        res.status(200).json({
            message: "Posts fetched successfully",
            posts
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching posts",
            error: error.message
        });
    }
};

const globalFeedController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const feed = await Post.find()
            .populate("user", "userName profilePic")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            message: "Global feed fetched successfully",
            feed
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching global feed",
            error: error.message
        });
    }
}

export { postsController, getPostsController, globalFeedController };