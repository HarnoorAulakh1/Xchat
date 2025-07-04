import { IoIosSend } from "react-icons/io";
import { IoIosCall } from "react-icons/io";
import { FaVideo } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { useContext, useEffect, useRef, useState } from "react";
import { messageContext } from "../../contexts/messages";
import { currentContext } from "@/contexts/current";
import Landing from "./landing";
import { profileContext } from "@/contexts/profile";
import type { messageInterface } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { api } from "@/lib/utils";
import { FaFileAlt } from "react-icons/fa";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import {GoSidebarCollapse} from "react-icons/go";

export default function ChatArea() {
  const {
    current: { profilePicture, username, _id, isGroup },
  } = useContext(currentContext);

  return (
    <div className="w-full h-full rounded-2xl p-3">
      <div className=" rounded-2xl w-full h-full">
        {username ? (
          <Messaging
            _id={_id}
            isGroup={isGroup}
            profilePicture={profilePicture}
            username={username}
          />
        ) : (
          <Landing />
        )}
      </div>
    </div>
  );
}

function Messaging({
  _id,
  profilePicture,
  username,
  isGroup,
}: {
  _id: string;
  profilePicture: string;
  username: string;
  isGroup?: boolean;
}) {
  const startRef = useRef<HTMLDivElement>(null);
  const { messages, setMessages } = useContext(messageContext);
  const { user,setUser } = useContext(profileContext);
  const [file, setFile] = useState<File>();
  useEffect(() => {
    setTimeout(() => {
      if (startRef.current)
        startRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 200);
  }, [messages]);
  useEffect(() => {
    const socket = user.socket;
    if (!socket) return;
    const handleNewMessage = async (data: { message: messageInterface }) => {
      try {
        const response = await api.post(
          `/message/markAsRead?sender=${user._id}&receiver=${_id}&readBy=${user._id}&time=${data.message.created_at}`
        );
        console.log("Marked messages as read:", response.data);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
      if (
        (isGroup && _id == data.message.group) ||
        (data.message.receiver &&
          data.message.sender._id == _id &&
          data.message.receiver._id == user._id) ||
        (data.message.receiver &&
          data.message.sender._id &&
          data.message.receiver._id == _id)
      )
        setMessages((prev) => [...prev, data.message]);
    };
    socket.on("receive_message", handleNewMessage);
    // socket.on("message_read",)
    return () => {
      socket.off("receive_message", handleNewMessage);
    };
  }, [setMessages, user.socket, user._id, _id, isGroup]);

  useEffect(() => {
    async function getMessages() {
      try {
        const response = await api.get(
          `/message/getMessages?sender=${user._id}&receiver=${_id}&group=${
            isGroup ? _id : ""
          }`
        );
        if (response.status === 200) {
          const data = response.data;
          setMessages(data);
        } else {
          console.error("Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }

    if (_id && user._id) getMessages();
  }, [_id, user._id, setMessages, isGroup]);

  function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get("content") as string;
    const socket = user.socket;
    if (!socket) return;
    const newMessage: messageInterface = {
      sender: {
        _id: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
      },
      receiver: {
        _id: _id,
        username: username,
        profilePicture: profilePicture,
      },
      created_at: new Date().toISOString(),
      content,
    };
    let newMessage1: {
      sender: string;
      receiver: string;
      content: string;
      group?: string;
      file?: {
        type: string;
        name: string;
        link: File;
      };
    } = {
      sender: user._id,
      receiver: _id,
      content,
    };
    if (file && file.type) {
      newMessage.file = {
        type: file.type.split("/")[0],
        name: file.name,
        link: URL.createObjectURL(file),
      };
      newMessage1 = {
        ...newMessage1,
        file: {
          type: file.type.split("/")[0],
          name: file.name,
          link: file,
        },
      };
    }
    if (isGroup) {
      newMessage.group = _id;
      newMessage1.group = _id;
    }
    console.log("Sending message:", newMessage);
    socket.emit("send_message", newMessage1);
    setMessages(() => [...messages, newMessage]);
    setFile({} as File);
    (e.target as HTMLFormElement).reset();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileInput = e.target;
    if (fileInput.files && fileInput.files.length > 0) {
      const selectedFile = fileInput.files[0];
      setFile(selectedFile);
    }
  }
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-row items-center gap-2 p-3 ">
         <button
              onClick={() => setUser((x)=> ({ ...x, collapse: !x.collapse }))}
              className="p-2 rounded-xl hover:bg-gray-700 text-md "
            >
              <GoSidebarCollapse className="text-xl text-[#e5e5e5]" />
            </button>
        <h1 className="text-[#e5e5e5]  font-bold">Xchat</h1>
      </div>
      <div className="flex flex-row bg-[#0a0a0a] rounded-t-2xl items-center justify-between p-3 border-b border-gray-700">
        <div className="flex flex-row items-center gap-4">
          {profilePicture != "NULL" ? (
            <img
              src={profilePicture}
              className="w-15 h-15 bg-gray-500 rounded-full"
            ></img>
          ) : (
            <div className="w-12 h-12 bg-gray-500 rounded-full flex justify-center items-center"></div>
          )}
          <span className="text-lg font-semibold">{username}</span>
        </div>
        <div className="flex flex-row items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-gray-700">
            <IoIosCall className="text-xl" />
          </button>
          <button className="p-2 rounded-xl hover:bg-gray-700">
            <FaVideo className="text-xl" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 bg-[#0a0a0a]">
        <div className="flex flex-col gap-2">
          {messages.map((message, index) => (
            <Message
              key={index}
              message={message.content}
              file={message.file}
              time={message.created_at}
              isSender={message.sender.username === user.username}
              readBy={message.isRead}
              receiver={message.receiver?._id}
            />
          ))}
          <div ref={startRef} className=" w-full h-4"></div>
        </div>
      </div>
      <form
        onSubmit={(e) => sendMessage(e)}
        className="p-3 border-t border-gray-700 bg-[#0a0a0a] rounded-b-2xl"
      >
        <div className="flex flex-row  items-center">
          <div className="w-full gap-2 flex flex-row items-center">
            <label
              htmlFor="fileUpload"
              className="hover:bg-gray-700 p-2 rounded-lg"
            >
              <FaPlus />
              <input
                id="fileUpload"
                onChange={(e) => handleFileUpload(e)}
                type="file"
                className="hidden"
              />
            </label>
            <input
              name="content"
              type="text"
              className="flex-1 p-2 bg-gray-800 text-white rounded-xl outline-none"
              placeholder="Type a message..."
            />
            <button className="p-2 text-white rounded-lg hover:bg-blue-700">
              <IoIosSend className="text-xl" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
function Message({
  message,
  file,
  time,
  isSender,
  readBy,
  receiver,
}: {
  message: string;
  file?: {
    type: string;
    name: string;
    link: string;
  };
  time: string;
  isSender: boolean;
  readBy:
    | {
        user: string;
        readAt: Date;
      }[]
    | undefined;
  receiver?: string;
}) {
  const { user } = useContext(profileContext);
  const [time1] = useState<string>(formatTime(time));
  const { current } = useContext(currentContext);
  const [isRead, setRead] = useState(
    readBy && readBy.length > 0 && readBy.some((read) => read.user === receiver)
  );
  useEffect(() => {
    const socket = user.socket;
    if (!socket) return;
    const handleMessageRead = (data: {
      sender: string;
      receiver: string;
      time: string;
    }) => {
      console.log("Message read event received:", data);
      if (
        ((data.sender === user._id && data.receiver === receiver) ||
          (data.sender === receiver && data.receiver === user._id)) &&
        new Date(data.time).toISOString >= new Date(time).toISOString
      ) {
        setRead(true);
      }
    };
    if (!isRead) socket.on("message_read", handleMessageRead);
    return () => {
      socket.off("message_read", handleMessageRead);
    };
  }, [user.socket, user._id, time, receiver, isRead]);
  return (
    <div
      className={`flex flex-col  items-center ${
        isSender
          ? "bg-green-800 text-white self-end"
          : "bg-gray-800 text-white self-start"
      } rounded-lg max-w-[30rem] min-w-[5rem]`}
    >
      <div
        className={`flex flex-col gap-4 ${
          isSender
            ? "bg-green-800 text-white self-end"
            : "bg-gray-800 text-white self-start"
        } p-2 rounded-lg max-w-xs`}
      >
        <div className="flex flex-row items-center gap-2">
          <p>{message}</p>
        </div>
        {file && (
          <div className="flex flex-col gap-2 items-center">
            {file.type == "image" ? (
              <a
                href={file.link}
                className="text-blue-400 hover:underline "
                target="_blank"
              >
                {file.link && <img src={file.link} alt="" />}
              </a>
            ) : (
              <a
                href={file.link}
                className="text-blue-400 hover:underline cursor-pointer"
                target="_blank"
              >
                <div className="flex justify-center cursor-pointer items-center">
                  <FaFileAlt className="text-[3rem] text-gray-300" />
                </div>
              </a>
            )}
            <span className="text-xs text-gray-200">{file.name}</span>
          </div>
        )}
      </div>
      <div className="flex flex-row justify-end w-full mr-2">
        <p
          className={`${isSender ? "text-[#d0d0d0]" : "text-gray-400"} text-xs`}
        >
          {time1}
        </p>
        {isSender && (
          <div className="flex flex-row  gap-0">
            <IoCheckmarkDoneOutline
              className={` ${
                isRead && !current.isGroup ? "text-blue-400" : "text-gray-400"
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
