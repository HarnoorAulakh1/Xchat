import { Socket } from "socket.io-client";
export interface userInterface {
  _id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  profilePicture: string;
  isOnline: boolean;
  socket?: Socket | null;
}

export interface messageInterface {
  _id?: string;
  sender: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  receiver?: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  file?:{
    type: string;
    name: string;
    link: string;
  },
  group?:string,
  content: string;
  created_at: string;
  isRead?: {
    user: string;
    readAt: Date;
  }[];
}

export interface notificationInterface {
  _id: string;
  sender?: string;
  receiver?: string;
  group?: string;
  title: string;
  description: string;
  type: string;
  time: number;
  popup?: boolean;
}

export interface groupInterface {
  _id: string;
  name: string;
  logo: string;
  members: string[];
  admins: string[];
}