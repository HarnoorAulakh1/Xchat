import React, { useEffect, useState } from "react";
import { notificationContext } from "./notification";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { IoMdPersonAdd } from "react-icons/io";
import type { notificationInterface } from "../lib/types";
import { profileContext } from "./profile";
import { useContext } from "react";

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, notify] = useState<notificationInterface[]>([]);
  const { user } = useContext(profileContext);
  useEffect(() => {
    const socket = user.socket;
    if (!socket) return;

    const handleFriendRequest = (data: {
      sender: string;
      notification: notificationInterface;
    }) => {
      console.log("Notification: Friend Request Received");
      notify((prev) => [...prev, data.notification]);
    };

    const handleFriendAccepted = (data: {
      sender: string;
      notification: notificationInterface;
    }) => {
      console.log("Notification: Friend Request Accepted");
      notify((prev) => [...prev, data.notification]);
    };

    socket.on("receive_friend_request", handleFriendRequest);
    socket.on("friend_request_accepted", handleFriendAccepted);
    return () => {
      socket.off("receive_friend_request", handleFriendRequest);
      socket.off("friend_request_accepted", handleFriendAccepted);
    };
  }, [user.socket]);

  return (
    <notificationContext.Provider value={{ notifications, notify }}>
      {children}
      <div className="flex flex-col justify-center items-center fixed top-2 left-[40%]">
        {notifications.map((item, index) => (
          (item!=undefined && <Tab
            key={index}
            _id={item._id}
            title={item.title}
            description={item.description}
            type={item.type}
            time={item.time}
            popup={item.popup}
          />)
        ))}
      </div>
    </notificationContext.Provider>
  );
}

function Tab({
  _id,
  title,
  description,
  type,
  time,
  popup = true,
}: {
  _id: string;
  title: string;
  description: string;
  type: string;
  time?: number;
  popup?: boolean;
}) {
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, time || 3000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {visible && popup && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex justify-center items-center"
          >
            <div className="backdrop-blur-lg bg-white/30 border border-white/20 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 max-w-md w-full">
              <Icon type={type} />
              <div className="flex flex-col text-sm text-black/90">
                <span className="font-semibold">{title}</span>
                <span className="text-xs text-black/70">{description}</span>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="ml-auto text-xs text-black/50 hover:text-black"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Icon({ type }: { type: string }) {
  return (
    <>
      {type == "success" ? (
        <div className="bg-green-500 text-white rounded-full p-3"></div>
      ) : type == "error" ? (
        <div className="bg-red-500 text-white rounded-full p-2"></div>
      ) : (
        <IoMdPersonAdd className="text-2xl text-green-500" />
      )}
    </>
  );
}
