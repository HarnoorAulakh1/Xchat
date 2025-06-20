import React, { useState } from 'react';
import { profileContext } from './profile';
import type { user } from '../lib/types';
export default function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [user,setUser] = useState<user>({
    username: "",
    name: "",
    email: "",
    profilePicture: "",
    isOnline: false,
    })
  return (
    <profileContext.Provider value={{ user, setUser }}>
      {children}
    </profileContext.Provider>
  );
}