const express = require('express');
const multer = require('multer');
const userRoutes = express.Router();
const { userRegister, userLogin, userProfile, profilePhotoUpload, whoViewedMyProfile,
    following, unfollow, block, unblock, adminBlockUser, adminUnblockUser, allUsers,
    updateProfile, updatePasword, deleteAccount } = require("../../controllers/User/userController");
const isLogin = require('../../middlewares/isLogin');
const isAdmin = require('../../middlewares/isAdmin');

const storage = require('../../config/cloudinary');
//instance of multer
const upload = multer({ storage });
//routes
userRoutes.post("/register", userRegister);
userRoutes.post("/login", userLogin)
userRoutes.get("/:id", isLogin, userProfile)
userRoutes.post("/profile-photo-upload", isLogin, upload.single('profile'), profilePhotoUpload)
userRoutes.get("/profile-viewer/:id", isLogin, whoViewedMyProfile)
userRoutes.get("/following/:id", isLogin, following);
userRoutes.get("/unfollow/:id", isLogin, unfollow)
userRoutes.get("/block/:id", isLogin, block)
userRoutes.get("/unblock/:id", isLogin, unblock)
userRoutes.put("/admin-block-user/:id", isLogin, isAdmin, adminBlockUser)
userRoutes.put("/admin-unblock-user/:id", isLogin, isAdmin, adminUnblockUser)
userRoutes.put("/update-profile", isLogin, updateProfile)
userRoutes.put("/update-password", isLogin, updatePasword)
userRoutes.delete("/delete-account", isLogin, deleteAccount)
//getAllUsers
userRoutes.get("/", isLogin, allUsers)

module.exports = userRoutes;    