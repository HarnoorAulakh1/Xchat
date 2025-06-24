import React, { useState } from "react";
import { profileContext } from "./profile";
import type { userInterface } from "../lib/types";
export default function ProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<userInterface>({
    _id: "",
    username: "",
    name: "",
    email: "",
    profilePicture: "",
    isOnline: false,
    socket: null,
  });
  return (
    <profileContext.Provider value={{ user, setUser }}>
      {children}
    </profileContext.Provider>
  );
}
