const Comment = require("../../models/Comment/Comment");
const User = require("../../models/User/User");

const createComment = async (req, res, next) => {
    const { description } = req.body;
    try {
        const post = await Post.findbyId(req.params.id);
        if (!post) {
            return next(appError("Post not found", 500))
        }
        const comment = await Comment.create({
            description,
            user: req.userAuth,
            post: post._id
        })
        post.comment.push(comment._id);
        await post.save({ valicateBeforeSave: false });
        const user = await User.findbyId(req.userAuth);
        user.comments.push(comment._id);
        await user.save({ valicateBeforeSave: false });
        res.json({
            status: "success",
            data: "You have created a comment"
        })
    } catch (err) {
        next(new Error(err.message, 500))
    }
}

//update comment
const updateComment = async (req, res, next) => {
    const { description } = req.body;
    try {
        const comment = await Comment.findbyId(req.params.id);
        if (comment.user.toString() !== req.user.toString()) {
            return next(appError("You are not the owner of this comment", 500))
        }
        await Comment.findByIdAndUpdate(req.params.id, {
            description,
        }, {
            new: true,
            runValidators: true
        })
        res.json({
            status: "success",
            data: "You have updated a comment"
        })
    } catch (err) {
        next(new Error(err.message, 500))
    }
}

//delete comments
const deleteComment = async (req, res, next) => {
    const { description } = req.body;
    try {
        const comment = await Comment.findbyId(req.params.id);
        if (comment.user.toString() !== req.user.toString()) {
            return next(appError("You are not the owner of this comment", 500))
        }
        await Comment.findByIdAndDelete(req.params.id)
        res.json({
            status: "success",
            data: "You have comment a comment"
        })
    } catch (err) {
        next(new Error(err.message, 500))
    }
}

module.exports = { createComment, deleteComment, updateComment }