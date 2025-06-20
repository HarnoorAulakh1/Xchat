import ChatArea from "@/components/chat/chatArea";
import SideBar from "@/components/sidebar";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { api } from "../lib/utils";
import { profileContext } from "@/contexts/profile";
import { useState } from "react";
import Loader from "@/lib/loader";
import { io, Socket } from "socket.io-client";
import { useRef } from "react";
import useNotify from "@/hooks/useNotify";
import type { notificationInterface } from "@/lib/types";

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(profileContext);
  const [loading, setLoading] = useState(false);
  const socket = useRef<Socket | null>(null);
  const { notify } = useNotify();
  useEffect(() => {
    async function check() {
      setLoading(false);
      try {
        const response = await api.post("/user/checkLogin");
        if (response.status == 200) {
          const data = response.data;
          console.log("User data:", data);
          setUser((x) => {
            return {
              ...x,
              _id: data._id,
              username: data.username,
              email: data.email,
              name: data.name,
              profilePicture: data.profilePicture,
              isOnline: data.isOnline,
            };
          });
        }
      } catch (err) {
        console.error(err);
        navigate("/auth");
        setLoading(true);
      }
      setLoading(true);
    }
    check();
    socket.current = io("http://localhost:8000", {
      withCredentials: true,
      transports: ["websocket"],
    });
    setUser((prevUser) => ({
      ...prevUser,
      socket: socket.current,
    }));
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [navigate, setUser]);
  useEffect(() => {
    if (socket.current && user.username)
      socket.current.emit("register", {
        username: user.username,
        _id: user._id,
      });
  }, [socket, user.username, user._id]);
  useEffect(() => {
    async function handle() {
      try {
        const response = await api.get(
          "/notification/getNotifications/" + user._id
        );
        console.log(response.data);
        if (response.status == 200) {
          let data = response.data;
          data = data.map((notification: notificationInterface) => {
            return {
              ...notification,
              popup: false,
            };
          });
          notify((x) => {
            return [...x, ...data];
          });
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    }
    if (user._id) handle();
  }, [notify, user._id]);
  return (
    <div className="bg-[#171717] text-[#e5e5e5] flex flex-row w-full h-[100%] overflow-y-hidden">
      {loading ? (
        <>
          <SideBar />
          <ChatArea />
        </>
      ) : (
        <Loader />
      )}
    </div>
  );
}
