const Category = require("../../models/Category/Category")

const createCategory = async (req, res, next) => {
    const { title } = req.body;
    try {
        const category = await Category.create({ title, user: req.userAuth });
        res.json({
            status: "success",
            data: category
        })
    }
    catch (err) {
        next(new Error(err.message, 500))
    }
}
const getAll = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.json({
            status: "success",
            data: categories,
        })
    } catch (err) {
        next(new Error(err.message, 500))
    }
}
const getSingleCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        res.json({
            status: "success",
            data: category,
        })
    } catch (err) {
        next(new Error(err.message, 500))
    }
}
const updateCategory = async (req, res, next) => {
    const { title } = req.body;
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, { title }, { new: true });
        res.json({
            status: "success",
            data: category,
        })
    } catch (err) {
        next(new Error(err.message, 500))
    }
}
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        res.json({
            status: "success",
            data: category,
        })
    } catch (err) {
        next(new Error(err.message, 500))
    }
}

module.exports = { createCategory, getAll, getSingleCategory, updateCategory, deleteCategory }