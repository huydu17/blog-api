const express = require('express');
const { createComment, deleteComment, updateComment } = require('../../controllers/Comment/commentController');
const isLogin = require('../../middlewares/isLogin');
const commentsRoutes = express.Router();

commentsRoutes.post("/create", isLogin, createComment)
commentsRoutes.put("/:id", isLogin, updateComment)
commentsRoutes.delete("/:id", isLogin, deleteComment)
module.exports = commentsRoutes;