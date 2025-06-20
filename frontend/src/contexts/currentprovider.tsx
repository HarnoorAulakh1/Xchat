import React, { useState } from "react";
import type { user } from "../lib/types";
import { currentContext } from "./current";
export default function ProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [current, setCurrent] = useState<{
    _id?: string;
    name: string;
    profilePicture: string;
    numberOfMembers?: number;
    isGroup: boolean;
    memebers?: user[];
  }>({
    _id: "",
    name: "",
    profilePicture: "",
    numberOfMembers: 1,
    isGroup: false,
    memebers: [],
  });
  return (
    <currentContext.Provider value={{ current, setCurrent }}>
      {children}
    </currentContext.Provider>
  );
}
