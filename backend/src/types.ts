export interface userInterface{
    _id?: string;
    username: string;
    password: string;
    name: string;
    email: string;
    groups?: string[];
    profilePicture: string;
    isOnline: boolean;
}

export interface messageInterface {
    _id?: string;
    sender: string;
    receiver?: string;
    group?: string;
    content: string;
    image?: string;
    file?: {
        name?: string;
        link?: string;
        type?: string;
    };
    timestamp?: string;
    isRead?: {
    user: string;
    readAt: Date;
    }[];
}
