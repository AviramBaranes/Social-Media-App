const Post = require("../models/Post");
const User = require("../models/User");

const uuid = require("uuid").v4;

exports.createPost = async (req, res) => {
  const { text, picUrl, location } = req.body;

  if (text.length < 1)
    return res.status(401).send("A post need to have a text field");
  try {
    const newPost = {
      user: req.userId,
      text,
    };
    if (picUrl) newPost.picUrl = picUrl;
    if (location) newPost.location = location;

    const post = await new Post(newPost).save();

    return res.json(post._id);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("comments.user");

    return res.json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.getDetailPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);

    if (!post) return res.status(404).send("Post not found");

    return res.status(200).json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { userId } = req;

    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send("post not found");
    }

    const user = await User.findById(userId);

    if (post.user.toString() !== userId) {
      if (user.role === "root") {
        await post.remove();
        return res.status(200).send("Post deleted Succefully");
      } else {
        return res.status(401).send("Unauthorized");
      }
    }
    await post.remove();
    return res.status(200).send("Post deleted Succefully");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const { userId } = req;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(401).send("Post not found");
    }

    console.log(`---------------------------post:`, post);

    const isLiked = post.likes.some((like) => like.user.toString() === userId);

    if (isLiked) {
      return res.status(401).send("Post already liked");
    }

    post.likes.unshift({ user: userId });
    await post.save();

    return res.status(200).send("post been liked");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.unLikePost = async (req, res) => {
  try {
    const { userId } = req;
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(401).send("Post not found");
    }

    const likedPostIndex = post.likes.findIndex(
      (like) => like.user.toString() === userId
    );

    if (likedPostIndex === -1) {
      return res.status(401).send("Post not yet liked");
    }

    post.likes.splice(likedPostIndex, 1);
    await post.save();
    return res.status(200).send("post unliked");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.getAllLikes = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate("likes.user");
    if (!post) {
      return res.status(401).send("Post not found");
    }

    return res.status(200).json(post.likes);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.postComment = async (req, res) => {
  try {
    const { postId } = req.params;

    const { text } = req.body;

    if (text.length < 1) {
      return res.status(401).send("Comment need to have some text");
    }
    const post = await Post.findById(postId);

    const newComment = {
      _id: uuid(),
      user: req.userId,
      text,
      date: Date.now(),
    };

    post.comments.unshift(newComment);

    await post.save();

    return res.status(200).json(newComment._id);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId, postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(401).send("post not found");
    }
    const comment = post.comments.find((comment) => comment._id === commentId);

    if (!comment) {
      return res.status(401).send("Comment not found");
    }

    const user = await User.findById(req.userId);

    const commentDeleter = async () => {
      const commentIndex = post.comments.findIndex(
        (comment) => comment._id === commentId
      );
      post.comments.splice(commentIndex, 1);
      await post.save();
      return res.status(200).send("deleted comment");
    };

    if (comment.user.toString() !== req.userId) {
      if (user.role === "root") {
        commentDeleter();
      } else {
        return res.status(401).send("Unauthorized!");
      }
    }
    commentDeleter();
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};
