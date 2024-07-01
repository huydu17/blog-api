const express = require('express');
const postRoutes = express.Router();
const multer = require('multer');
const storage = require('../../config/cloudinary');
//instance of multer
const upload = multer({ storage });

const { createPost, fetchPost, toggleLikePost, toggleDislikePost,
    numberOfViews, getPost, updatePost, deletePost } = require("../../controllers/Post/postController");
const isLogin = require('../../middlewares/isLogin');
//create post
postRoutes.post("/create", isLogin, upload.single("image"), createPost);
postRoutes.get("/", isLogin, fetchPost);
postRoutes.get("/like/:id", isLogin, toggleLikePost);
postRoutes.get("/dislie/:id", isLogin, toggleDislikePost);
postRoutes.get("/viewed/:id", isLogin, numberOfViews);
postRoutes.get("/:id", isLogin, getPost);
postRoutes.put("/:id", isLogin, updatePost);
postRoutes.delete("/:id", isLogin, deletePost);
module.exports = postRoutes;