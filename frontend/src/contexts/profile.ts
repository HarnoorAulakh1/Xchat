import { createContext } from "react";
import type { userInterface } from "../lib/types";
import { Socket } from "socket.io-client";

export const profileContext = createContext<{
  user: {
    _id: string;
    username: string;
    password?: string;
    name: string;
    email: string;
    profilePicture: string;
    isOnline: boolean;
    socket?: Socket | null;
  };
  setUser: React.Dispatch<React.SetStateAction<userInterface>>;
}>({
  user: {
    _id: "",
    username: "johndoe",
    name: "John Doe",
    email: "",
    profilePicture: "https://example.com/profile.jpg",
    isOnline: true,
    socket: null,
    password: "",
  },
  setUser: () => {},
});
