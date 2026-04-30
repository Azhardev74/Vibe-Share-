import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import Post from "../models/post.js";
import { io } from "../app.js"

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

        // ✅ Populate user (modern way)
        const populatedPost = await Post.findById(newPost._id).populate(
            "user",
            "userName profilePic"
        );

        // ✅ Format like feed
        const formattedPost = {
            ...populatedPost._doc,
            likesCount: 0,
            isLiked: false,
        };

        // ✅ Emit AFTER save
        io.emit("newPost", formattedPost);
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
        const userId = req.user.userId;
        console.log(userId)
        // console.log(posts)
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
            .populate("comments.user", "userName profilePic") // ✅ ADD THIS
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const updatedFeed = feed.map(post => {
            const isLiked = req.user
                ? post.likes.some(id => id.toString() === req.user.userId.toString())
                : false;

            return {
                ...post._doc,
                likesCount: post.likes.length,
                isLiked
            };
        });

        res.status(200).json({
            message: "Global feed fetched successfully",
            feed: updatedFeed
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching global feed",
            error: error.message
        });
    }
};

const LikeController = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { postId } = req.params;


        // Check if already liked (minimal read)
        const post = await Post.findById(postId).select("likes");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const isLiked = post.likes.some(
            (id) => id.toString() === userId
        );

        let updatedPost;

        if (isLiked) {
            // 🔻 UNLIKE (atomic remove)
            updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $pull: { likes: userId } },
                { returnDocument: "after" }
            ).select("likes");
        } else {
            // 🔺 LIKE (atomic add, prevents duplicates)
            updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $addToSet: { likes: userId } },
                { returnDocument: "after" }
            ).select("likes");
        }
        io.emit("postUpdated", {
            postId,
            likesCount: updatedPost.likes.length,
            isLiked: !isLiked
        })

        return res.status(200).json({
            message: isLiked ? "Post unliked" : "Post liked",
            postId, // ✅ ADD THIS
            likesCount: updatedPost.likes.length,
            isLiked: !isLiked,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error toggling like",
            error: error.message,
        });
    }
};


const commentController = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;
        const { text, clientId } = req.body;

        if (!text?.trim()) {
            return res.status(400).json({
                message: "Comment text is required"
            });
        }

        // ✅ push comment
        await Post.findByIdAndUpdate(postId, {
            $push: {
                comments: {
                    user: userId,
                    text,
                    createdAt: new Date(),
                    clientId
                }
            }
        });

        // ✅ FETCH ONLY LAST COMMENT (POPULATED)
        const post = await Post.findById(postId)
            .populate("comments.user", "userName profilePic");

        const newComment = post.comments.at(-1);

        // 🔥 emit populated comment
        io.emit("commentAdded", {
            postId,
            comment: newComment,
            clientId
        });

        return res.status(201).json({
            message: "Comment added successfully",
            comment: newComment
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error in comment",
            error: error.message
        });
    }
};

export { postsController, getPostsController, LikeController, commentController, globalFeedController };