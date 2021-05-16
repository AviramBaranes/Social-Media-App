import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { useState } from "react";
import { Popup, Image, List } from "semantic-ui-react";

import baseURL from "../../utils/baseUrl";
import catchErrors from "../../utils/catchErrors";
import { LikesPlaceHolder } from "../Layout/PlaceHolderGroup";

function LikesList({ postId, trigger }) {
  const [likesList, setLikeList] = useState([]);
  const [loading, setLoading] = useState(false);

  const getLikesList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseURL}/api/post/like/${postId}`, {
        headers: { Authorization: Cookies.get("token") },
      });
      setLikeList(res.data);
    } catch (err) {
      catchErrors(err);
    }

    setLoading(false);
  };

  return (
    <Popup
      on="click"
      onClose={() => setLikeList([])}
      onOpen={getLikesList}
      popperDependencies={[LikesList]}
      trigger={trigger}
      wide
    >
      {loading ? (
        <LikesPlaceHolder />
      ) : (
        <>
          {likesList.length > 0 && (
            <div
              style={{
                overflow: "auto",
                maxHeight: "15rem",
                height: "15rem",
                minWidth: "210px",
              }}
            >
              <List selection size="large">
                {likesList.map((like) => (
                  <List.Item key={like._id}>
                    <Image avatar src={like.user.profilePicUrl} />
                    <List.Content>
                      <Link href={`/${like.user.username}`}>
                        <List.Header as="a" content={like.user.name} />
                      </Link>
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </div>
          )}
        </>
      )}
    </Popup>
  );
}
export default LikesList;
