const mongoose = require('mongoose');
const Post = require('../Post/Post');
const { appError } = require('../../utils/appError');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Firt Name is required"]
    },
    lastName: {
        type: String,
        required: [true, "Last Name is required"]
    },
    profilePhoto: {
        type: String
    },
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    passWord: {
        type: String,
        required: [true, "Password is required"]
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["Admin", "Guest", "Editor"]
    },
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    }],
    blocked: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    // plan: {
    //     type: String,
    //     enum: ["Free", "Premium", "Pro"],
    //     default: "Free"
    // },
    userAward: {
        type: String,
        enum: ["Bronze", "Silver", "Gold"],
        default: "Bronze"
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
},);
//xử lý lấy ngày đăng bài cuối cùng
//Hooks
//pre-before record is saved
userSchema.pre("/findOne/", async function (next) {
    console.log(this);
    //post -after saving  
    userSchema.virtual('fullname').get(function () {
        return this.firstName + " " + this.lastName;
    })
    userSchema.virtual('initialname').get(function () {
        return this.firstName[0] + this.lastName[0];
    });
    userSchema.virtual('postCount').get(function () {
        return this.posts.length;
    });
    userSchema.virtual('followerCount').get(function () {
        return this.followers.length;
    });
    userSchema.virtual('blockedCount').get(function () {
        return this.blocked.length;
    });
    userSchema.virtual('viewersCount').get(function () {
        return this.viewers.length;
    });
    //populate user's post
    this.populate("posts");
    // this.populate({
    //     path: "posts"
    // });
    //get the user Id
    const userId = this._conditions._id;
    //find the post create by the user
    const posts = await Post.find({ user: userId })
    //get the last post created by the user
    const lastPost = posts[posts.length - 1];
    //get the last post date
    const lastPostDate = new Date(lastPost?.createdAt);
    const lastPostDateStr = lastPostDate.toDateString();
    userSchema.virtual("lastPostDate").get(function () {
        return lastPostDateStr;
    })

    // check if user is inactive for 30 days
    const currentDate = new Date();
    //get the difference between current date and last post date
    const diff = currentDate - lastPostDate;
    const diffinDays = diff / (1000 * 3600 * 24);
    if (diffinDays > 30) {
        userSchema.virtual("isInactive").get(function () {
            return true;
        })
        await User.findByIdAndUpdate(userId, {
            isBlocked: true,
        }, {
            new: true,
        })
    } else {
        userSchema.virtual("isInactive").get(function () {
            return false;
        })
        await User.findByIdAndUpdate(userId, {
            isBlocked: false,
        }, {
            new: true,
        })
    }

    // Last active date of the user
    const lastActiveDay = Math.floor(diffinDays);
    userSchema.virtual("lastActiveDay").get(function () {
        if (lastActiveDay <= 0) {
            return "Today";
        }
        else if (lastActiveDay === 1) {
            return "Yesterday";
        } else {
            return `${lastActiveDay} + days ago`;
        }
    })
    //Upgrade your account
    const postCount = posts.length;
    if (postCount < 10) {
        await User.findByIdAndUpdate(userId, {
            userAward: "Bronze",
        }, {
            new: true,
            runValidators: true
        })
    } else if (postCount > 10) {
        await User.findByIdAndUpdate(userId, {
            userAward: "Silver",
        }, {
            new: true,
            runValidators: true
        })
    } else {
        await User.findByIdAndUpdate(userId, {
            userAward: "Gold",
        }, {
            new: true,
            runValidators: true
        })
    }
    next();
})



const User = mongoose.model("User", userSchema);
module.exports = User;