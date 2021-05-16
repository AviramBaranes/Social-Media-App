const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const postController = require("../controller/post");

router.post("/", authMiddleware, postController.createPost);

router.get("/", authMiddleware, postController.getPosts);

router.get("/:postId", authMiddleware, postController.getDetailPost);

router.delete("/:postId", authMiddleware, postController.deletePost);

router.post("/like/:postId", authMiddleware, postController.likePost);

router.post("/unLike/:postId", authMiddleware, postController.unLikePost);

router.get("/like/:postId", authMiddleware, postController.getAllLikes);

router.post("/comment/:postId", authMiddleware, postController.postComment);

router.delete(
  "/:postId/:commentId",
  authMiddleware,
  postController.deleteComment
);

module.exports = router;
