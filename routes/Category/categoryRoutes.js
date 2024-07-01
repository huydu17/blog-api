const express = require('express');
const { createCategory, getAll, getSingleCategory, updateCategory, deleteCategory } = require('../../controllers/Category/categoryController');
const isLogin = require('../../middlewares/isLogin');
const categoryRoutes = express.Router();

categoryRoutes.get("/", isLogin, getAll);
categoryRoutes.get("/:id", isLogin, getSingleCategory);
categoryRoutes.post("/create", isLogin, createCategory);
categoryRoutes.put("/update/:id", isLogin, updateCategory);
categoryRoutes.delete("/delete/:id", isLogin, deleteCategory);
module.exports = categoryRoutes;