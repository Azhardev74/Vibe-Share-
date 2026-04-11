import bcrypt from "bcryptjs";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import streamifier from "streamifier";
// import cloudinary from "../config/cloudinary.js";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dxqjk3sk1",
  api_key: 968344377257183,
  api_secret: "6OQwz7KPuvb254BA11mNq2E7Z6M",
});


const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email
        },
        process.env.SECRET_KEY,
        { expiresIn: process.env.EXPIRES_IN }
    );
};

const registerUser = async (req, res) => {
  try {
    let { userName, email, password, bio } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    email = email.toLowerCase();

    if (password.length < 6) {
      return res.status(422).json({ message: "Password must be at least 6 characters" });
    }

    const existUser = await User.findOne({ $or: [{ email }, { userName }] });

    if (existUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    let profilePicUrl = "";

    // ✅ FIXED IMAGE UPLOAD
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profiles" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      profilePicUrl = result.secure_url;
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      email,
      password: hashPassword,
      profilePic: profilePicUrl,
      bio,
      followers: [],
      following: []
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio
      },
      token: `Bearer ${token}`
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email & password required" });
        }

        email = email.toLowerCase();

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);

        return res.status(200).json({
            user: {
                _id: user._id,
                userName: user.userName,
                email: user.email,
                profilePic: user.profilePic,
                bio: user.bio
            },
            token: `Bearer ${token}`
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export { registerUser, loginUser };