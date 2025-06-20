import type { userInterface } from "@/lib/types";
import { useEffect, useState, useContext } from "react";
import { api } from "@/lib/utils";
import { profileContext } from "@/contexts/profile";
import { formatTime } from "@/lib/utils";

import { currentContext } from "@/contexts/current";

export default function ChatList() {
  const [friends, setFriends] = useState<userInterface[]>([]);
  const { user } = useContext(profileContext);
  useEffect(() => {
    const socket = user.socket;
    if (!socket) return;
    const add_friend = (data: { user: userInterface }) => {
      setFriends((prev) => [...prev, data.user]);
    };
    socket.on("add_friend", add_friend);
    return () => {
      socket.off("add_friend", add_friend);
    };
  }, [user.socket]);
  useEffect(() => {
    async function fetchFriends() {
      try {
        const response = await api.get("/user/getFriends/" + user._id);
        if (response.status == 200) {
          const data = response.data;
          setFriends(data);
        } else {
          console.error("Failed to fetch friends");
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    }
    fetchFriends();
  }, [user._id]);
  return (
    <div className="flex flex-col gap-1 h-full overflow-y-auto">
      {friends.length > 0 ? (
        friends.map((friend) => (
          <ChatListItem key={friend._id} user1={friend} />
        ))
      ) : (
        <div className="flex justify-center items-center h-full">
          <span className="text-gray-500">No friends found</span>
        </div>
      )}
    </div>
  );
}

function ChatListItem({ user1 }: { user1: userInterface }) {
  const [preview, setPreview] = useState("");
  const [time, setTime] = useState("...");
  const [isOnline, setIsOnline] = useState(false);
  const { user } = useContext(profileContext);
  const { _id, username, profilePicture, name } = user1;
  const { setCurrent } = useContext(currentContext);
  const [unread, setUnread] = useState<number>(0);
  useEffect(() => {
    const socket = user.socket;
    if (!socket || !username) return;
    const handleOnlineStatus = (data: {
      username: string;
      isOnline: boolean;
    }) => {
      if (data.username == username) {
        setIsOnline(data.isOnline);
      }
    };
    socket.on("user_status", handleOnlineStatus);
    return () => {
      socket.off(username, handleOnlineStatus);
    };
  }, [username, user.socket]);
  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await api.get(
          "/user/getPreview?sender=" + _id + "&receiver=" + user._id
        );
        if (response.status == 200) {
          const data = response.data;
          if (data && data._id) {
            const temp = formatTime(data.created_at);
            setTime(temp);
          }
          const content = data.content;
          if (content && content.length > 20)
            setPreview(
              content.substring(0, 20) + (content.length > 20 ? "..." : "")
            );
          else setPreview(content);
        }
      } catch (error) {
        console.error("Error fetching preview:", error);
        setPreview("No messages yet ...");
      }
    };
    async function checkOnlineStatus() {
      try {
        const response = await api.get("/user/isOnline/" + _id);
        if (response.status == 200) {
          const data = response.data;
          setIsOnline(data.isOnline);
        }
      } catch (error) {
        console.error("Error checking online status:", error);
      }
    }
    async function checkUnread() {
      try {
        const response = await api.get(
          `/message/getUnreadCount?sender=${_id}&receiver=${user._id}&readBy=${user._id}`
        );
        if (response.status == 200) {
          const data = response.data;
          if (data && data.count) {
            setUnread(data.count);
          }
        }
      } catch (error) {
        console.error("Error checking unread messages:", error);
      }
    }
    checkUnread();
    checkOnlineStatus();
    fetchPreview();
  }, [_id, user._id]);
  async function setCurrrentChat() {
    try {
      const response=await api.post(
        `/message/markAsRead?sender=${user._id}&receiver=${_id}&readBy=${user._id}`
      );
      console.log("Marked messages as read:", response.data);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
    setUnread(0);
    setCurrent(() => {
      return {
        _id: _id,
        username: username,
        profilePicture: profilePicture,
        name: name,
        isOnline: isOnline,
        isGroup: false,
      };
    });
  }
  return (
    <div
      onClick={setCurrrentChat}
      className="flex flex-row items-center gap-2 p-2 group hover:bg-[#454545] rounded-lg cursor-pointer"
    >
      <div className="flex flex-row items-end justify-center">
        {profilePicture != "NULL" ? (
          <img
            src={profilePicture}
            className="w-14 h-12 bg-gray-500 rounded-full"
          ></img>
        ) : (
          <div className="w-12 h-12 bg-gray-500 rounded-full flex justify-center items-center"></div>
        )}
        <div
          className={`rounded-full w-2 h-2 ${
            isOnline == true ? "bg-green-500" : ""
          }`}
        >
          {isOnline}
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="flex flex-row justify-between">
          <span className="text-sm font-semibold">{username}</span>
          <p
            className={`text-sm text-gray-500 transition-all duration-150  group-hover:translate-x-[-1rem]`}
          >
            {time}
          </p>
        </div>
        <div className="flex flex-row justify-between w-full">
          <span className="text-xs text-gray-400">{preview}</span>{" "}
          {unread != 0 && (
            <div className="rounded-full w-5 h-5 text-center bg-green-500 text-black text-sm">
              {unread}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
