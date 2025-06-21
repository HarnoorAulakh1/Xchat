import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { useState } from "react";
import ChatList from "./chat/chatList";
import { IoPersonAddSharp } from "react-icons/io5";
import Popup from "@/lib/popup";
import { AddFriend } from "./addFriend";
import { IoIosNotifications } from "react-icons/io";
import Notifications from "./notifications";
import { CiLogout } from "react-icons/ci";
import { api } from "@/lib/utils";
import { useNavigate } from "react-router";
import { GoSidebarCollapse } from "react-icons/go";

export default function SideBar() {
  const [focus, setFocus] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [collapse, setCollapse] = useState(false);
  async function logout() {
    await api.post("/user/logout");
    navigate("/auth");
  }
  return (
    <div
      className={`${
        collapse ? "w-[7%]" : "w-[30%]"
      } p-3 flex flex-col gap-4 h-full`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between">
          <h1 className="font-bold text-xl">Chats</h1>
          <div className="flex flex-row items-center ml-2">
            <button
              onClick={() => setCollapse(!collapse)}
              className="p-2 rounded-xl hover:bg-gray-700 text-md"
            >
              <GoSidebarCollapse className="text-xl text-[#e5e5e5]" />
            </button>
            {!collapse && (
              <>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl hover:bg-gray-700 text-md"
                >
                  <CiLogout className="text-xl text-[#e5e5e5]" />
                </button>
                <Popup
                  title="Add Friend"
                  trigger={
                    <button className="p-2 rounded-xl hover:bg-gray-700 text-md">
                      <IoPersonAddSharp />
                    </button>
                  }
                >
                  <AddFriend />
                </Popup>
                <Popup
                  title="Notifications"
                  trigger={
                    <button className="p-2 rounded-xl hover:bg-gray-700 text-md">
                      <IoIosNotifications className="text-xl" />
                    </button>
                  }
                >
                  <Notifications />
                </Popup>
              </>
            )}
          </div>
        </div>
        {!collapse && (
          <div
            className={`flex flex-row rounded-md px-2 ${
              focus ? "border-white border-1" : ""
            } border-gray-700 border-1  items-center gap-2`}
          >
            <IoIosSearch className="text-xl" />
            <input
              onClick={() => setFocus(true)}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              value={search}
              type="text"
              className="w-full h-7 text-sm outline-none border-0"
              placeholder="Add a chat or search"
            />
            {focus && (
              <RxCross2
                className="text-sm cursor-pointer text-black w-4 rounded-full bg-gray-300"
                onClick={() => {
                  setFocus(false);
                  setSearch("");
                }}
              />
            )}
          </div>
        )}
      </div>
      <div className="h-full">
        <ChatList search={search} collapse={collapse} />
      </div>
    </div>
  );
}
