const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"]
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: "Category",
        required: [true, "Post category is required"]
    },
    numViews: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    likes: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    disLikes: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    comments: [{
        type: mongoose.Types.ObjectId,
        ref: "Comment"
    }],
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "Please author is required"]
    },
    photo: {
        type: String,
        required: [true, "Photo is required"]
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true }
},);

//Hooks
postSchema.pre(/^find/, function (next) {
    postSchema.virtual("likesCount").get(function () {
        return this.likes.length;
    })
    postSchema.virtual("dislikesCount").get(function () {
        return this.disLikes.length;
    })
    postSchema.virtual("likeInPercents").get(function () {
        const post = this;
        const total = +post.likes.length + +post.disLikes.length;
        const percent = (post.likes.length / total) * 100;
        return `${percent}%`
    })
    postSchema.virtual("dislikeInPercents").get(function () {
        const post = this;
        const total = +post.likes.length + +post.disLikes.length;
        const percent = (post.disLikes.length / total) * 100;
        return `${percent}%`
    })
    postSchema.virtual("postDaysAgo").get(function () {
        const dayCreated = new Date(this.createdAt);
        const daysAgo = Math.floor((Date.now() - dayCreated) / (1000 * 3600 * 24));
        return daysAgo <= 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`;
    });
    next();
})

const Post = mongoose.model("Post", postSchema);
module.exports = Post;