import { useState, useRef } from "react";
import { Form, Button, Image, Divider, Message, Icon } from "semantic-ui-react";
import { newPostSubmit } from "../../utils/postActions";

import uploadPic from "../../utils/uploadPicToCloudinary";

function CreatePost({ user, setPosts }) {
  const inputRef = useRef();

  const [newPost, setNewPost] = useState({ text: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [highlighted, setHighlighted] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const changeHandler = (e) => {
    const { name, value, files } = e.target;

    if (name === "media") {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    } else {
      setNewPost((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    let picUrl;

    if (media) {
      picUrl = await uploadPic(media);
      if (!picUrl) {
        setLoading(false);
        return setError("Image upload failed");
      }
    }

    await newPostSubmit(
      user,
      newPost.text,
      newPost.location,
      picUrl,
      setPosts,
      setNewPost,
      setError
    );
    setMediaPreview(null);
    setMedia(null);
    setLoading(false);
  };

  const addStyles = () => {
    return {
      textAlign: "center",
      height: "150px",
      width: "150px",
      border: "dotted",
      paddingTop: media === null && "60px",
      cursor: "ponter",
      borderColor: highlighted ? "green" : "black",
    };
  };

  return (
    <>
      <Form error={error !== null} onSubmit={submitHandler}>
        <Message
          error
          content={error}
          onDismiss={() => setError(null)}
          header="Oops!"
        />
        <Form.Group>
          <Image src={user.profilePicUrl} circular avatar inline />
          <Form.TextArea
            placeholder="Write Something"
            name="text"
            value={newPost.text}
            onChange={changeHandler}
            rows={4}
            width={14}
          />
        </Form.Group>
        <Form.Group>
          <Form.Input
            name="location"
            icon="map marker alternate"
            value={newPost.location}
            onChange={changeHandler}
            placeholder="Wanna add a location?"
            label="Add Location"
          />

          <input
            ref={inputRef}
            onChange={changeHandler}
            name="media"
            style={{ display: "none" }}
            type="file"
            accept="image/*"
          />
        </Form.Group>
        <div
          style={addStyles()}
          onDragOver={(e) => {
            e.preventDefault();
            setHighlighted(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setHighlighted(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setHighlighted(true);

            const droppedFile = Array.from(e.dataTransfer.files);
            setMedia(droppedFile[0]);
            setMediaPreview(URL.createObjectURL(droppedFile[0]));
          }}
        >
          {media === null ? (
            <Icon
              name="plus"
              onClick={() => inputRef.current.click()}
              size="big"
            />
          ) : (
            <Image
              style={{ height: "150px", width: "150px" }}
              src={mediaPreview}
              alt="postImage"
              centered
              size="medium"
              onClick={() => inputRef.current.click()}
            />
          )}
        </div>
        <Divider hidden />
        <Button
          circular
          disabled={newPost.text === "" || loading}
          content={<strong>Post</strong>}
          style={{ backgroundColor: "#1DA1F2", color: "white" }}
          icon="send"
          loading={loading}
        />
      </Form>
    </>
  );
}

export default CreatePost;
