import { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import baseUrl from "../utils/baseUrl";
import { parseCookies } from "nookies";
import Chat from "../Components/Chats/Chat";
import { Segment, Header, Divider, Comment, Grid } from "semantic-ui-react";
import { useRouter } from "next/router";
import ChatListSearch from "../Components/Chats/ChatListSearch";
import { NoMessages } from "../Components/Layout/NoData";
import Message from "../Components/Messages/Message";
import Banner from "../Components/Messages/Banner";
import MessageInputField from "../Components/Messages/MessageInputField";
import getUserInfo from "../utils/getUserInfo";
import newMsgSound from "../utils/newMsgSound";
import Cookies from "js-cookie";

const scrollDivToBottom = (divRef) => {
  divRef.current !== null &&
    divRef.current.scrollIntoView({ behaviour: "smooth" });
};

function Messages({ chatsData, errorLoading, user }) {
  const router = useRouter();

  const socket = useRef();
  const openChatId = useRef("");
  const divRef = useRef();

  const [chats, setChats] = useState(chatsData);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [bannerData, setBannerData] = useState({ name: "", profilePicUrl: "" });

  //socket connection
  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl);
    }

    if (socket.current) {
      socket.current.emit("join", { userId: user._id });

      socket.current.on("connectedUsers", ({ users }) => {
        users.length > 0 && setConnectedUsers(users);
      });
    }

    if (chats.length > 0 && !router.query.message) {
      router.push(`/messages?message=${chats[0].messageWith}`, undefined, {
        shallow: true,
      });
    }

    return () => {
      if (socket.current) {
        socket.current.emit("disconnect");
        socket.current.off();
      }
    };
  }, []);

  //load messages
  useEffect(() => {
    const loadMessage = () => {
      socket.current.emit("loadMessages", {
        userId: user._id,
        messageWith: router.query.message,
      });

      socket.current.on("messageLoaded", ({ chat }) => {
        setMessages(chat.messages);
        setBannerData({
          name: chat.messageWith.name,
          profilePicUrl: chat.messageWith.profilePicUrl,
        });

        openChatId.current = chat.messageWith._id;
        divRef.current && scrollDivToBottom(divRef);
      });

      socket.current.on("noChatFound", async () => {
        const { name, profilePicUrl } = await getUserInfo(router.query.message);

        setBannerData({ name, profilePicUrl });
        setMessages([]);

        openChatId.current = router.query.message;
      });
    };

    if (socket.current && router.query.message) {
      loadMessage();
    }
  }, [router.query.message]);

  const sendMsg = (msg) => {
    if (socket.current) {
      socket.current.emit("sendNewMessage", {
        userId: user._id,
        msgSendToUserId: openChatId.current,
        msg,
      });
    }
  };

  //sending and receiving messages functonallity
  useEffect(() => {
    if (socket.current) {
      socket.current.on("msgSent", ({ newMsg }) => {
        if (newMsg.receiver === openChatId.current) {
          setMessages((prev) => [...prev, newMsg]);

          setChats((prev) => {
            const previousChat = prev.find(
              (chat) => chat.messageWith === newMsg.receiver
            );
            previousChat.lastMessage = newMsg.msg;
            previousChat.data = newMsg.date;

            return [...prev];
          });
        }
      });

      socket.current.on("newMsgReceived", async ({ newMsg }) => {
        let senderName;
        if (newMsg.sender === openChatId.current) {
          setMessages((prev) => [...prev, newMsg]);

          setChats((prev) => {
            const previousChat = prev.find(
              (chat) => chat.messageWith === newMsg.sender
            );
            previousChat.lastMessage = newMsg.msg;
            previousChat.date = newMsg.date;
            senderName = previousChat.name;

            return [...prev];
          });
        } else {
          const isChatExist = chats.find(
            (chat) => chat.messageWith === newMsg.sender
          );

          if (isChatExist) {
            setChats((prev) => {
              const previousChat = prev.find(
                (chat) => chat.messageWith === newMsg.sender
              );
              previousChat.lastMessage = newMsg.msg;
              previousChat.date = newMsg.date;
              senderName = previousChat.name;

              return [...prev];
            });
          } else {
            const { name, profilePicUrl } = await getUserInfo(newMsg.sender);
            senderName = name;
            const newChat = {
              messageWith: newMsg.sender,
              name,
              profilePicUrl,
              lastMessage: newMsg.msg,
              date: newMsg.date,
            };
            setChats((prev) => [newChat, ...prev]);
          }
        }
        newMsgSound(senderName);
      });
    }
  }, []);

  //scroll down on every new message
  useEffect(() => {
    messages.length > 0 && scrollDivToBottom(divRef);
  }, [messages]);

  const deleteMessage = (messageId) => {
    if (socket.current) {
      socket.current.emit("deleteMessage", {
        userId: user._id,
        messageWith: openChatId.current,
        messageId,
      });

      socket.current.on("msgDeleted", () => {
        setMessages((prev) =>
          prev.filter((message) => message._id !== messageId)
        );
      });
    }
  };

  const deleteChat = async (messageWith) => {
    try {
      await axios.delete(`${baseUrl}/api/chats/${messageWith}`, {
        headers: { Authorization: Cookies.get("token") },
      });
      setChats((prev) =>
        prev.filter((chat) => chat.messageWith !== messageWith)
      );

      router.push("/messages", undefined, { shallow: true });
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  };

  return (
    <>
      <Segment padded basic size="large" style={{ marginTop: "5px" }}>
        <Header
          icon="home"
          content="Go Back"
          onClick={() => router.push("/")}
          style={{ cursor: "pointer" }}
        />
        <Divider hidden />
        <div style={{ marginBottom: "10px" }}>
          <ChatListSearch user={user} chats={chats} setChats={setChats} />
        </div>

        {chats.length > 0 ? (
          <>
            <Grid stackable>
              <Grid.Column width={4}>
                <Comment.Group size={4}>
                  <Segment
                    raised
                    style={{ overflow: "auto", maxHeight: "32rem" }}
                  >
                    {chats.map((chat, i) => (
                      <Chat
                        deleteChat={deleteChat}
                        connectedUsers={connectedUsers}
                        key={i}
                        chat={chat}
                        setChats={setChats}
                      />
                    ))}
                  </Segment>
                </Comment.Group>
              </Grid.Column>

              <Grid.Column width={12}>
                {router.query.message && (
                  <>
                    <div
                      style={{
                        overflow: "auto",
                        overflowX: "hidden",
                        maxHeight: "35rem",
                        height: "35rem",
                        backgroundColor: "whitesmoke",
                      }}
                    >
                      <div style={{ position: "sticky", top: "0" }}>
                        <Banner bannerData={bannerData} />
                      </div>
                      {messages.length > 0 &&
                        messages.map((message, i) => (
                          <Message
                            divRef={divRef}
                            key={i}
                            bannerProfilePic={bannerData.profilePicUrl}
                            message={message}
                            user={user}
                            deleteMessage={deleteMessage}
                          />
                        ))}
                    </div>
                    <MessageInputField sendMsg={sendMsg} />
                  </>
                )}
              </Grid.Column>
            </Grid>
          </>
        ) : (
          <NoMessages />
        )}
      </Segment>
    </>
  );
}

Messages.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);

    const res = await axios.get(`${baseUrl}/api/chats`, {
      headers: { Authorization: token },
    });

    return { chatsData: res.data };
  } catch (err) {
    console.log(err);
    return { errorLoading: true };
  }
};

export default Messages;
