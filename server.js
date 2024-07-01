const express = require("express");
require("dotenv").config();
require("./config/dbConnect");
const userRoutes = require("./routes/User/userRoutes");
const postRoutes = require("./routes/Post/postRoutes");
const categoryRoutes = require("./routes/Category/categoryRoutes");
const commentsRoutes = require("./routes/Comment/commentRoutes");
const globalErrorHandler = require("./middlewares/globalErrorHandle");

const app = express();
//middleware
app.use(express.json());
//routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/comment", commentsRoutes);
//Error handlers middleware
app.use(globalErrorHandler);
//Not Found middleware
app.use("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});
//Listen to server
const PORT = process.env.PORT || 9000;
app.listen(PORT, console.log("Server is up and running on", PORT));
