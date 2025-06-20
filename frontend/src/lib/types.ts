export interface userInterface {
  _id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  profilePicture: string;
  isOnline: boolean;
}

export interface messageInterface {
  _id?: string;
  sender: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  receiver: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  file?:{
    type: string;
    name: string;
    link: string;
  }
  content: string;
  created_at: string;
  isRead?: boolean;
}

export interface notificationInterface {
  _id: string;
  sender?: string;
  receiver?: string;
  title: string;
  description: string;
  type: string;
  time: number;
  popup?: boolean;
}
