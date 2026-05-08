import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import Post from "../models/post.js";
import User from "../models/user.js";
import { io } from "../app.js"

// Post Controller 
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

// User Posts Controller 
const getPostsController = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user.userId }).populate("user", "userName profilePic").lean();
        const userId = req.user.userId;
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

// Feed Controller 
const globalFeedController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        const feed = await Post.find()
            .populate("user", "userName profilePic followers")
            .populate("comments.user", "userName profilePic ") // ✅ ADD THIS
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
                isLiked,
                isFollowing: post.user.followers?.some(
                    id => id.toString() === req.user.userId.toString()
                )
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

// Like Controller 
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

// Comment Controller
const commentController = async (req, res) => {
  try {

    const { postId } = req.params;

    const userId = req.user.userId;

    const {
      text,
      clientId,
    } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!text?.trim()) {

      return res.status(400).json({
        success: false,
        message: "Comment required",
      });
    }

    // =========================
    // CREATE COMMENT
    // =========================
    const updatedPost =
      await Post.findByIdAndUpdate(
        postId,
        {
          $push: {
            comments: {
              user: userId,
              text: text.trim(),
              createdAt: new Date(),
            },
          },
        },
        {
          new: true,
        }
      ).populate(
        "comments.user",
        "userName profilePic"
      );

    if (!updatedPost) {

      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // =========================
    // GET NEW COMMENT
    // =========================
    const newComment =
      updatedPost.comments.at(-1);

    // =========================
    // SOCKET EMIT
    // =========================
    io.emit("commentAdded", {
      postId,
      clientId,
      comment: newComment,
    });

    // =========================
    // RESPONSE
    // =========================
    return res.status(201).json({
      success: true,
      message: "Comment added",
      comment: newComment,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Follower Following Controller 
const followController = async (req, res) => {
    try {

        const userId = req.user.userId;
        const targetUserId = req.params.userId;

        if (userId === targetUserId) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself"
            });
        }

        const [currentUser, targetUser] = await Promise.all([
            User.findById(userId),
            User.findById(targetUserId)
        ]);

        if (!currentUser || !targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isFollowing = targetUser.followers.some(
            id => id.toString() === userId.toString()
        );
        if (isFollowing) {

            await Promise.all([
                User.findByIdAndUpdate(targetUserId, {
                    $pull: { followers: userId }
                }),

                User.findByIdAndUpdate(userId, {
                    $pull: { following: targetUserId }
                })
            ]);

        } else {

            await Promise.all([
                User.findByIdAndUpdate(targetUserId, {
                    $addToSet: { followers: userId }
                }),

                User.findByIdAndUpdate(userId, {
                    $addToSet: { following: targetUserId }
                })
            ]);
        }

        const newFollowState = !isFollowing;

        io.emit("followUpdated", {
            targetUserId,
            followerId: userId,
            isFollowing: newFollowState
        });

        return res.status(200).json({
            success: true,
            message: newFollowState
                ? "User followed successfully"
                : "User unfollowed successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const searchProfileController = async (req, res) => {
    try {

        const userId = req.user.userId;

        let { query } = req.query;

        // =========================
        // VALIDATION
        // =========================
        if (!query || typeof query !== "string") {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        query = query.trim();

        if (query.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must be at least 2 characters"
            });
        }

        // =========================
        // ESCAPE REGEX
        // =========================
        const escapedQuery = query.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const regex = new RegExp(escapedQuery, "i");

        // =========================
        // SEARCH USERS
        // =========================
        const users = await User.find({
            _id: { $ne: userId }, // exclude self
            $or: [
                { userName: regex },
                { email: regex }
            ]
        })
            .select(
                "userName email profilePic followers following"
            )
            .limit(10)
            .lean();

        // =========================
        // FORMAT RESPONSE
        // =========================
        const formattedUsers = users.map((user) => ({
            _id: user._id,
            userName: user.userName,
            email: user.email,
            profilePic: user.profilePic,
            followersCount: user.followers?.length || 0,
            followingCount: user.following?.length || 0,
            isFollowing: user.followers?.some(
                (id) => id.toString() === userId.toString()
            )
        }));

        return res.status(200).json({
            success: true,
            count: formattedUsers.length,
            users: formattedUsers
        });

    } catch (error) {

        console.error("Search Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export {
    searchProfileController,
    postsController,
    getPostsController,
    LikeController,
    commentController,
    globalFeedController,
    followController
};