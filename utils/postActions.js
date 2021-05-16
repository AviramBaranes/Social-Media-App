import axios from "axios";
import cookie from "js-cookie";

import baseUrl from "./baseUrl";
import catchErrors from "./catchErrors";

const Axios = axios.create({
  baseURL: `${baseUrl}/api/post`,
  headers: { Authorization: cookie.get("token") },
});

export const newPostSubmit = async (
  user,
  text,
  location,
  picUrl,
  setPosts,
  setNewPost,
  setError
) => {
  try {
    const res = await Axios.post("/", { text, location, picUrl });

    const newPost = {
      _id: res.data,
      user,
      text,
      location,
      picUrl,
      likes: [],
      comment: [],
    };

    setPosts((prevState) => [newPost, ...prevState]);
    setNewPost({ text: "", location: "" });
  } catch (err) {
    const errorMsg = catchErrors(err);
    setError(errorMsg);
  }
};

export const deletePost = async (postId, setPosts, setShowToastr) => {
  try {
    await Axios.delete(`/${postId}`);
    setPosts((prev) => prev.filter((post) => post._id !== postId));
    setShowToastr(true);
  } catch (err) {
    const errorMsg = catchErrors(err);
    setError(errorMsg);
  }
};

export const likePost = async (postId, userId, setLikes, like = true) => {
  try {
    if (like) {
      await Axios.post(`/like/${postId}`);
      setLikes((prev) => [...prev, { user: userId }]);
    } else if (!like) {
      await Axios.post(`/unlike/${postId}`);
      setLikes((prev) => prev.filter((like) => like.user !== userId));
    }
  } catch (err) {
    const errorMsg = catchErrors(err);
    setError(errorMsg);
  }
};

export const commentPost = async (postId, user, text, setComments, setText) => {
  try {
    const res = await Axios.post(`/comment/${postId}`, { text });
    const newComment = {
      _id: res.data,
      user,
      text,
      date: Date.now(),
    };
    setComments((prev) => [newComment, ...prev]);
    setText("");
  } catch (err) {
    const errorMsg = catchErrors(err);
    setError(errorMsg);
  }
};

export const deletePostComment = async (postId, commentId, setComments) => {
  try {
    await Axios.delete(`/${postId}/${commentId}`);
    setComments((prev) => prev.filter((comment) => comment._id !== commentId));
  } catch (err) {
    const errorMsg = catchErrors(err);
    setError(errorMsg);
  }
};
