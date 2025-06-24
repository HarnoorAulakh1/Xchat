import { IoMdNotificationsOff } from "react-icons/io";
import { IoMdPersonAdd } from "react-icons/io";
import { useState } from "react";
import { useContext } from "react";
import { profileContext } from "../contexts/profile";
import { api } from "../lib/utils";
import Loader from "../lib/loader";
import type { notificationInterface } from "@/lib/types";
import { notificationContext } from "@/contexts/notification";

export default function Notifications() {
  const { notifications, notify } = useContext(notificationContext);
  const [loading] = useState<boolean>(false);
  console.log("Notifications:", notifications);
  return (
    <div className="w-full flex flex-col p-2 items-center gap-4 overflow-y-scroll h-full">
      <>
        {loading ? (
          <div className="w-full h-full flex justify-center items-center">
            <Loader />
          </div>
        ) : notifications && notifications.length > 0 ? (
          notifications.map(
            (notification: notificationInterface) =>
              notification != undefined && (
                <Tab
                  key={notification._id}
                  _id={notification._id}
                  sender={notification.sender}
                  group={notification.group}
                  receiver={notification.receiver}
                  title={notification.title}
                  description={notification.description}
                  type={notification.type}
                  notify={notify}
                />
              )
          )
        ) : (
          <Empty />
        )}
      </>
    </div>
  );
}

function Tab({
  _id,
  sender,
  receiver,
  group,
  title,
  description,
  type,
  notify,
}: {
  _id?: string;
  sender?: string;
  receiver?: string;
  group?: string;
  title?: string;
  description?: string;
  type?: string;
  notify: React.Dispatch<React.SetStateAction<notificationInterface[]>>;
}) {
  const [visible, setVisible] = useState<boolean>(true);
  const { user } = useContext(profileContext);
  async function remove() {
    setVisible(false);
    notify((x) => x.filter((item) => item._id !== _id));
    if (sender && (receiver || group) && _id)
      await api.delete("/notification/deleteNotification/" + _id);
  }
  function handle(action: string) {
    const socket = user.socket;
    notify((x) => x.filter((item) => item._id !== _id));
    setVisible(false);
    if (socket){
      if(group)
        socket.emit("groupRequestAction", {
        sender,
        receiver,
        group,
        action,
      });
      else
      socket.emit("requestAction", {
        sender,
        receiver,
        action,
      });}
  }
  return (
    <>
      {visible && (
        <div className="w-full flex justify-center items-center">
          <div className="backdrop-blur-lg bg-white/30 border border-white/20 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 max-w-md w-full">
            <IoMdPersonAdd className="text-2xl text-green-500" />
            <div className="flex flex-col text-sm text-black/90">
              <span className="font-semibold">{title}</span>
              <span className="text-xs text-black/70">{description}</span>
            </div>
            {type == "request" && (
              <div className="flex flex-row items-center gap-2">
                <button
                  onClick={() => handle("accept")}
                  className="px-3 py-1 cursor-pointer border-1 hover:bg-white hover:text-green-500 border-gray-400  text-white rounded-md transition-all duration-150"
                >
                  Accept
                </button>
                <button
                  onClick={() => handle("reject")}
                  className="px-3 py-1 cursor-pointer bg-red-500 hover:bg-white hover:text-red-500 text-white rounded-md  transition-all duration-150"
                >
                  Decline
                </button>
              </div>
            )}
            <button
              onClick={() => remove()}
              className="ml-auto transition-all duration-150 hover:text-lg text-xs text-black/50 hover:text-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Empty() {
  return (
    <div className=" text-white p-4  w-full h-full flex flex-col justify-center items-center">
      <IoMdNotificationsOff className="text-6xl text-red-500" />
      <p className="mt-2 font-bold text-3xl">You have no new notifications.</p>
    </div>
  );
}
