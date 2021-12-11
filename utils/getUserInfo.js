import axios from "axios";
import Cookies from "js-cookie";
import baseUrl from "./baseUrl";

const getUserInfo = async (userToFindId) => {
  try {
    const res = await axios.get(`${baseUrl}/api/chats/user/${userToFindId}`, {
      headers: { Authorization: Cookies.get("token") },
    });

    const { name, profilePicUrl } = res.data;
    return { name, profilePicUrl };
  } catch (error) {
    console.log(error);
  }
};
export default getUserInfo;
