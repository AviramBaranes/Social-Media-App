import React, { useState, useEffect } from "react";
import { Feed, Segment, Divider, Container } from "semantic-ui-react";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import { parseCookies } from "nookies";
import { NoNotifications } from "../Components/Layout/NoData";
import Cookies from "js-cookie";
import LikeNotifications from "../Components/Notifications/LikeNotifications";
import FollowerNotification from "../Components/Notifications/FollowerNotification";
import CommentNotification from "../Components/Notifications/CommentNotification";

function Notifications({ notifications, errorLoading, user, userFollowStats }) {
  const [loggedUserFollowStats, setUserFollowStats] = useState(userFollowStats);

  useEffect(() => {
    const notificationsRead = async () => {
      try {
        await axios.post(
          `${baseUrl}/api/notifications`,
          {},
          { headers: { Authorization: Cookies.get("token") } }
        );
      } catch (err) {
        console.log(err);
      }
    };
    return () => {
      notificationsRead();
    };
  }, []);

  return (
    <>
      <Container style={{ marginTop: "1.5rem" }}>
        {notifications.length > 0 ? (
          <Segment color="teal" raised>
            <div
              style={{
                maxHeight: "40rem",
                overflow: "auto",
                height: "40rem",
                position: "relative",
                width: "100%",
              }}
            >
              <Feed size="small">
                {notifications.map((notification) => (
                  <>
                    {notification.type === "newLike" &&
                      notification.post !== null && (
                        <LikeNotifications
                          key={notification._id}
                          notification={notification}
                        />
                      )}

                    {notification.type === "newComment" &&
                      notification.post !== null && (
                        <CommentNotification
                          key={notification._id}
                          notification={notification}
                        />
                      )}

                    {notification.type === "newFollower" && (
                      <FollowerNotification
                        key={notification._id}
                        notification={notification}
                        loggedUserFollowStats={loggedUserFollowStats}
                        setUserFollowStats={setUserFollowStats}
                      />
                    )}
                  </>
                ))}
              </Feed>
            </div>
          </Segment>
        ) : (
          <NoNotifications />
        )}
        <Divider hidden />
      </Container>
    </>
  );
}

Notifications.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);

    const res = await axios.get(`${baseUrl}/api/notifications`, {
      headers: { Authorization: token },
    });

    return { notifications: res.data };
  } catch (err) {
    console.log(err);
    return { errorLoading: true };
  }
};

export default Notifications;
