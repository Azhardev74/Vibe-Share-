import express from "express";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { postsController, getPostsController } from "../controllers/postController.js";
const postRouter = express.Router();

postRouter.post("/post", protect, upload.single("image"), postsController);
postRouter.get("/posts", protect, getPostsController);

export { postRouter };
