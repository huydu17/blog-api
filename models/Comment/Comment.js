const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, "Post is required"]
    }],
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User is required"]
    }],
    description: {
        type: String,
        required: [true, "Description is required"]
    }
}, {
    timestamps: true
})

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;