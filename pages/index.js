import { useState, useEffect } from "react";
import axios from "axios";
import { Segment } from "semantic-ui-react";
import { parseCookies } from "nookies";

import baseUrl from "../utils/baseUrl";
import { NoPosts } from "../Components/Layout/NoData";
import CardPost from "../Components/Posts/CardPost";
import CreatePost from "../Components/Posts/CreatePost";
import { PostDeleteToastr } from "../Components/Layout/Toastr";

function Index({ user, postsData, errorLoading }) {
  const [posts, setPosts] = useState(postsData);
  const [showToastr, setShowToastr] = useState(false);

  useEffect(() => {
    document.title = `Welcome, ${user.name.split(" ")[0]}`;
  }, []);

  useEffect(() => {
    showToastr && setTimeout(() => setShowToastr(false), 3000);
  }, [showToastr]);

  if (posts.length === 0 || errorLoading) return <NoPosts />;

  return (
    <>
      {showToastr && <PostDeleteToastr />}
      <Segment>
        <CreatePost user={user} setPosts={setPosts} />
        {posts.map((post) => (
          <CardPost
            key={post._id}
            user={user}
            post={post}
            setPosts={setPosts}
            setShowToastr={setShowToastr}
          />
        ))}
      </Segment>
    </>
  );
}

Index.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);

    const res = await axios.get(`${baseUrl}/api/post`, {
      headers: { Authorization: token },
    });

    return { postsData: res.data };
  } catch (err) {
    console.log(err);
    return { errorLoading: true };
  }
};
export default Index;
