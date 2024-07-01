const Post = require("../../models/Post/Post")
const User = require("../../models/User/User");
const { appError } = require("../../utils/appError");

const createPost = async (req, res, next) => {
    const { title, description, category } = req.body;
    try {
        const user = await User.findById(req.userAuth);
        if (user.isBlocked) {
            return next(appError("Access Denied, account blocked", 403))
        }
        const post = await Post.create({
            title: title,
            description: description,
            user: user._id,
            category: category,
            photo: req?.file?.path
        })
        user.posts.push(post);
        await user.save();
        res.json({
            status: "success",
            data: post
        })
    }
    catch (err) {
        next(new Error(err.message, 500));
    }
}

//hiding post from blocked users
const fetchPost = async (req, res, next) => {
    try {
        //find all blocked
        const posts = await Post.find({}).populate("user").populate("category", "title");
        //check if user is blocked by the post owner
        const filterPosts = posts.filter(post => {
            const blockedUsers = post.user.blocked;
            //kiểm tra người dùng hiện tại có nằm trong blockeduser hay không -> true/false
            const isBlocked = blockedUsers.includes(req.userAuth);
            return !isBlocked; //return isBlocked ? null : posts;
        })
        res.json({
            status: "success",
            data: filterPosts
        })
    }
    catch (err) {
        next(appError(err.message, 500));
    }
}
//toggleLikePost
const toggleLikePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return next(appError("Post not found", 500))
        }
        const isLikePost = post.likes.includes(req.userAuth);
        if (isLikePost) {
            return next(appError("You have already liked this post", 500))
        }
        post.likes.push(req.userAuth);
        await post.save();
        res.json({
            status: "success",
            data: "You have liked this post"
        })
    } catch (err) {
        next(appError(err.message, 500))
    }
}
//toggleDislikePost
const toggleDislikePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return next(appError("Post not found", 500))
        }
        const isDislikePost = post.disLikes.includes(req.userAuth);
        if (isDislikePost) {
            return next(appError("You have already disliked this post", 500))
        }
        post.disLikes.push(req.userAuth);
        await post.save();
        res.json({
            status: "success",
            data: "You have disliked this post"
        })
    } catch (err) {
        next(appError(err.message, 500))
    }
}
//numofViews
const numberOfViews = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return next(appError("Post not found", 500))
        }
        const isViewed = post.numViews.includes(req.userAuth);
        if (isDislikePost) {
            return false;
        }
        post.numViews.push(req.userAuth);
        await post.save();
        res.json({
            status: "success",
            data: "You have viewed this post"
        })
    } catch (err) {
        next(appError(err.message, 500))
    }
}
const getPost = async (req, res, next) => {
    try {
        const post = await Post.find({})
        if (!post) {
            return next(appError("Post not found", 500))
        }
        res.json({
            status: "success",
            data: post
        })
    } catch (err) {
        next(appError(err.message, 500))
    }
}

//update
const updatePost = async (req, res, next) => {
    const { title, description, category } = req.body;
    try {
        const checkPost = await Post.findById(req.params.id);
        if (checkPost.user.toString() !== req.userAuth.toString()) {
            return next(appError("You not allowed to update", 500))
        }
        const post = await Post.findByIdAndUpdate(req.params.id, {
            title,
            description,
            category,
            photo: req?.file?.path
        },
            { new: true });
        res.json({
            status: "success",
            data: "Update post successfully updated",
        })
    } catch (err) {
        next(new Error(err.message, 500))
    }
}

//update
const deletePost = async (req, res, next) => {
    const { title, description, category } = req.body;
    try {
        const checkPost = await Post.findById(req.params.id);
        if (checkPost.user.toString() !== req.userAuth.toString()) {
            return next(appError("You not allowed to delete", 500))
        }
        const post = await Post.findByIdAndDelete(req.params.id);
        res.json({
            status: "success",
            data: "Delete post successfully",
        })
    } catch (err) {
        next(new Error(err.message, 500))
    }
}

module.exports = {
    createPost,
    fetchPost,
    toggleLikePost,
    toggleDislikePost,
    numberOfViews, getPost, updatePost, deletePost
}