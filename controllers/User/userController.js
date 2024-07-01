const User = require("../../models/User/User");
const bcrypt = require("bcrypt");
const generateToken = require("../../utils/generatToken");
const getTokenFromHeader = require("../../utils/getTokenFromHeader");
const { appError, AppError } = require("../../utils/appError");
const Post = require("../../models/Post/Post");
const Category = require("../../models/Category/Category");
const Comment = require("../../models/Comment/Comment");
const userRegister = async (req, res, next) => {
  const { firstName, lastName, email, passWord, profilePhoto } = req.body;
  try {
    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return next(appError("Email already registered", 500));
    }
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(passWord, salt);
    const user = await User.create({
      firstName,
      lastName,
      email,
      passWord: hashPass,
    });
    res.send({
      message: "User created successfully",
      success: true,
    });
  } catch (err) {
    next(appError(err.message));
  }
};

const userLogin = async (req, res, next) => {
  const { email, passWord } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(appError("Email not found", 500));
    }
    const isMatch = await bcrypt.compare(user.passWord, passWord);
    if (!isMatch) {
      return next(appError("Passsword is not match", 500));
    }
    res.json({
      status: "Successfully logged in",
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user.id),
      },
    });
  } catch (err) {
    next(new Error(err.message));
  }
};
const userProfile = async (req, res, next) => {
  const { id } = req.params;
  try {
    const token = getTokenFromHeader(req);
    const user = await User.findById(id);
    res.json({
      status: "Successfully checked profile",
      data: user,
    });
  } catch (err) {
    next(new Error(err.message));
  }
};

const profilePhotoUpload = async (req, res, next) => {
  try {
    //update photo for user
    //1. Find the user to be uploaded
    const userToUpdate = await User.findById(req.userAuth);
    //2. Check if user is found
    if (!userToUpdate) {
      return next(appError("User not found", 500));
    }
    //3. Check if user is blocked
    if (userToUpdate.isBlocked) {
      return next(appError("User is blocked", 403));
    }
    //4. Check if user is updating their photo
    if (req.file) {
      //5. Update profile photo
      await User.findByIdAndUpdate(
        req.userAuth,
        {
          $set: {
            profilePhoto: req.file.path,
          },
        },
        {
          new: true,
        }
      );
      return res.json({
        message: "Successfully uploaded profile photo",
      });
    }
  } catch (err) {
    next(new Error(err.message, 500));
  }
};

const whoViewedMyProfile = async (req, res, next) => {
  try {
    //1. Find the orginal user
    const user = await User.findById(req.params.id);
    //2. Find the user who viewed the original user
    const userWhoViewed = await User.findById(req.userAuth);
    //3. Check if original who vỉewed are found
    if (user && userWhoViewed) {
      //4.Check if userWhoViewed is already in users viewers array
      const isUserAlreadyViewed = user.viewers.find(
        (viewer) => viewer.toString() === userWhoViewed._id.toString()
      );
      if (isUserAlreadyViewed) {
        return next(appError("User already in users viewers", 500));
      } else {
        //5. push viewer
        await user.viewers.push(userWhoViewed._id);
        await user.save();
        res.json({
          status: "success",
          data: "You have successfully viewed this profile",
        });
      }
    }
  } catch (err) {
    next(new Error(err.message, 500));
  }
};

//following-follower
const following = async (req, res, next) => {
  try {
    const userWhofollow = await User.findById(req.userAuth);
    const userToFollow = await User.findById(req.params.id);
    if (userWhofollow && userToFollow) {
      //check if userWhofollowed is already in the user's followers list
      const isUserAlreadyFollowed = userToFollow.followers.find(
        (follower) => follower.toString() === userWhofollow._id.toString()
      );
      if (isUserAlreadyFollowed) {
        return next(appError("You already followed this user", 500));
      } else {
        userToFollow.followers.push(userWhofollow._id);
        userWhofollow.following.push(userToFollow._id);
        await userToFollow.save();
        await userWhofollow.save();
        res.json({
          status: "success",
          data: "You have successfully followed this profile",
        });
      }
    }
  } catch (err) {
    next(new Error(err.message, 500));
  }
};

//unfollow
const unfollow = async (req, res, next) => {
  try {
    const userWhoUnfollowed = await User.findById(req.userAuth);
    const userToUnFollwed = await User.findById(req.params.id);
    if (userWhoUnfollowed && userToUnFollwed) {
      const isUserAlreadyFollowed = userToUnFollwed.followers.find(
        (follower) => follower.toString() === userWhoUnfollowed._id.toString()
      );
      if (!isUserAlreadyFollowed) {
        return next(appError("You have not followed this user", 500));
      } else {
        userToUnFollwed.followers = userToUnFollwed.followers.filter(
          (follower) => follower.toString() !== userWhoUnfollowed._id.toString()
        );
        await userToUnFollwed.save();
        userWhoUnfollowed.following = userWhoUnfollowed.following.filter(
          (following) => following.toString() !== userToUnFollwed._id.toString()
        );
        await userWhoUnfollowed.save();
        res.json({
          status: "success",
          data: "You have successfully unfollowed this profile",
        });
      }
    }
  } catch (err) {
    next(new Error(err.message, 500));
  }
};

//blocked
const block = async (req, res, next) => {
  try {
    const userToBeBlocked = await User.findById(req.params.id);
    const userWhoBlocked = await User.findById(req.userAuth);
    if (userToBeBlocked && userWhoBlocked) {
      const isUserAlreadyBlocked = userWhoBlocked.blocked.find(
        (blocked) => blocked.toString() === userToBeBlocked._id.toString()
      );
      if (isUserAlreadyBlocked) {
        return next(appError("You have already blocked this user", 500));
      } else {
        userWhoBlocked.blocked.push(userToBeBlocked._id);
        await userWhoBlocked.save();
        res.json({
          status: "success",
          data: "You have successfully blocked this profile",
        });
      }
    }
  } catch (err) {
    next(new Error(err.message, 500));
  }
};

//unblocked
const unblock = async (req, res, next) => {
  try {
    const userToBeUnblocked = await User.findById(req.params.id);
    const userWhoUnblocked = await User.findById(req.userAuth);
    if (userToBeUnblocked && userWhoUnblocked) {
      const isUserAlreadyunBlocked = userWhoUnblocked.blocked.find(
        (blocked) => blocked.toString() === userToBeUnblocked._id.toString()
      );
      if (!isUserAlreadyunBlocked) {
        return next(appError("You have not blocked this user", 500));
      } else {
        userWhoUnblocked.blocked = userWhoUnblocked.blocked.filter(
          (blocked) => blocked.toString() !== userToBeUnblocked._id.toString()
        );
        await userWhoUnblocked.save();
        res.json({
          status: "success",
          data: "You have successfully unblocked this profile",
        });
      }
    }
  } catch (err) {
    next(new Error(err.message, 500));
  }
};

//admin block user
const adminBlockUser = async (req, res, next) => {
  try {
    const userToBeBlocked = await User.findById(req.params.id);
    if (!userToBeBlocked) {
      return next(appError("User not found", 500));
    }
    userToBeBlocked.isBlocked = true;
    await userToBeBlocked.save();
    res.json({
      status: "success",
      data: "Admin blocked this user",
    });
  } catch (err) {
    next(new Error(err.message));
  }
};

//admin unblock user
const adminUnblockUser = async (req, res, next) => {
  try {
    const userToBeBlocked = await User.findById(req.params.id);
    if (!userToBeBlocked) {
      return next(appError("User not found", 500));
    }
    userToBeBlocked.isBlocked = false;
    await userToBeBlocked.save();
    res.json({
      status: "success",
      data: "Admin unblocked this user",
    });
  } catch (err) {
    next(new Error(err.message));
  }
};

//get All Users
const allUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      status: "success",
      data: users,
    });
  } catch (err) {
    next(new Error(err.message, 500));
  }
};

//update profile
const updateProfile = async (req, res, next) => {
  const { email, firstName, lastName } = req.body;
  try {
    const checkUserMail = await User.findOne({ email });
    if (checkUserMail) {
      return next(appError("Email is taken", 400));
    }
    const user = await User.findByIdAndUpdate(
      req.userAuth,
      {
        email,
        firstName,
        lastName,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json({
      status: "success",
      data: user,
    });
  } catch (err) {
    next(new Error(err.message, 500));
  }
};

//update pasword
const updatePasword = async (req, res, next) => {
  const { passWord } = req.body;
  try {
    if (passWord) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(passWord, salt);
      await User.findByIdAndUpdate(
        req.userAuth,
        {
          passWord: hash,
        },
        {
          new: true,
          runValidators: true,
        }
      );
    }
    res.json({
      status: "success",
      data: "Change password is successful",
    });
  } catch (err) {
    next(new Error(err.message, 500));
  }
};

//delete account
const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.userAuth);
    if (!user) {
      return next(appError("User not found", 500));
    }
    await Post.deleteMany({ user: req.userAuth });
    await Comment.deleteMany({ user: req.userAuth });
    await Category.deleteMany({ user: req.userAuth });
    await User.deleteOne({ user: req.userAuth });
    res.json({
      status: "success",
      data: "Your account has been deleted",
    });
  } catch (err) {
    next(new Error(err.message, 500));
  }
};
module.exports = {
  userRegister,
  userLogin,
  userProfile,
  profilePhotoUpload,
  whoViewedMyProfile,
  following,
  unfollow,
  block,
  unblock,
  adminBlockUser,
  adminUnblockUser,
  allUsers,
  updateProfile,
  updatePasword,
  deleteAccount,
};
