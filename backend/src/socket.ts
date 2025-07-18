import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import user from "./models/user.js";
import { notification } from "./models/notifications.js";
import message from "./models/message.js";
import { messageInterface } from "./types.js";
import { addMedia } from "./utils/messages.js";
import group from "./models/group.js";

const map = new Map<string, number>();

export const initSocket = (server: HTTPServer) => {
  const io = new Server(server, {
    maxHttpBufferSize: 2e7,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    //console.log("A user connected:", socket.id);
    socket.emit("welcome", { message: "Welcome to the chat!" });
    socket.on("register", async (data) => {
      socket.data.username = data.username;
      socket.data._id = data._id;
      map.set(
        data.username,
        map.has(data.username) ? map.get(data.username)! + 1 : 1
      );
      await user.updateOne({ _id: data._id }, { $set: { isOnline: true } });
      io.emit("user_status", {
        username: data.username,
        isOnline: true,
      });
      socket.join(data.username);
    });
    socket.on("sendFriendRequest", async (data) => {
      const { sender, receiver } = data;
      const receiver1 = await user.findOne({ _id: receiver });
      if (!receiver1) {
        console.error("Receiver not found");
        return;
      }
      const sender1 = await user.findOne({ _id: sender });
      if (!sender1) {
        console.error("Sender not found");
        return;
      }
      const check = await notification.findOne({
        sender: sender,
        receiver: receiver,
        type: "request",
      });
      const check1 = await user.findOne({
        _id: sender,
        friends: receiver,
      });
      if (check || check1) {
        return;
      }
      const notificationData = {
        sender: sender,
        receiver: receiver,
        title: "Friend Request",
        description: `${sender1.name} sent you a friend request`,
        type: "request",
      };
      const newNotification = new notification(notificationData);
      await newNotification.save();
      io.to(receiver1.username).emit("receive_friend_request", {
        sender: sender1.username,
        notification: newNotification,
      });
    });
    socket.on("sendGroupRequest", async (data) => {
      const { sender, receiver, group } = data;
      console.log("Group request data received:", data);
      const group1 = await group.findOne({ _id: group });
      const receiver1 = await user.findOne({ _id: receiver });
      const sender1 = await user.findOne({ _id: sender });
      if (!receiver1) {
        console.error("Receiver not found");
        return;
      }
      if (!group1) {
        console.error("Group not found");
        return;
      }
      if (!sender1) {
        console.error("Sender not found");
        return;
      }
      const check = await notification.findOne({
        sender,
        receiver,
        group,
        type: "request",
      });
      const check1 = await group1.members.find(
        (member: any) => member.toString() === receiver.toString()
      );
      if (check || check1) {
        return;
      }
      const notificationData = {
        sender: sender,
        receiver: receiver,
        group: group,
        title: "Group Request",
        description: `${sender1.name} sent you a group request to join ${group1.name}`,
        type: "request",
      };
      const newNotification = new notification(notificationData);
      await newNotification.save();
      io.to(receiver1.username).emit("receive_group_request", {
        sender: sender1.username,
        notification: newNotification,
      });
    });
    socket.on("groupRequestAction", async (data) => {
      const { sender, receiver, group: groupId, action } = data;
      if (action !== "accept" && action !== "reject") {
        console.error("Invalid action");
        return;
      }
      await notification.findOneAndDelete({
        sender,
        receiver,
        group: groupId,
        type: "request",
      });
      if (action === "accept") {
        const group1 = await group.findOne({ _id: groupId });
        const receiver1 = await user.findOne({ _id: receiver });
        const sender1 = await user.findOne({ _id: sender });
        if (!group1) {
          console.error("Group not found");
          return;
        }
        if (!receiver1) {
          console.error("Receiver not found");
          return;
        }
        if (!sender1) {
          console.error("Sender not found");
          return;
        }
        const notificationData = {
          sender: receiver,
          receiver: sender,
          group: groupId,
          title: "Group Request Accepted",
          description: `${receiver1.name} accepted your group request to join ${group1.name}`,
          type: "success",
        };
        const newNotification = new notification(notificationData);
        await newNotification.save();

        await group.updateOne(
          { _id: groupId },
          { $push: { members: receiver } }
        );
        await user.updateOne({ _id: receiver }, { $push: { groups: groupId } });
        io.to(sender1.username).emit("group_request_accepted", {
          sender: receiver1.username,
          notification: notificationData,
        });
        io.to(receiver1.username).emit("add_group", {
          group: group1,
        });
      }
    });
    socket.on("requestAction", async (data) => {
      //console.log("Friend request accepted:", data);
      const { sender, receiver, action } = data;
      if (action !== "accept" && action !== "reject") {
        console.error("Invalid action");
        return;
      }
      await notification.findOneAndDelete({
        sender,
        receiver,
        type: "request",
      });
      if (action === "accept") {
        const receiver1 = await user.findOne({ _id: receiver });
        if (!receiver1) {
          console.error("Receiver not found");
          return;
        }
        const sender1 = await user.findOne({ _id: sender });
        if (!sender1) {
          console.error("Sender not found");
          return;
        }
        const notificationData = {
          sender: receiver,
          receiver: sender,
          title: "Friend Request Accepted",
          description: `${receiver1.name} accepted your friend request`,
          type: "success",
        };
        const newNotification = new notification(notificationData);
        await newNotification.save();

        await user.updateOne({ _id: sender }, { $push: { friends: receiver } });
        await user.updateOne({ _id: receiver }, { $push: { friends: sender } });
        io.to(sender1.username).emit("friend_request_accepted", {
          sender: receiver1.username,
          notification: notificationData,
        });
        io.to(receiver1.username).emit("add_friend", {
          user: sender1,
        });
        io.to(sender1.username).emit("add_friend", {
          user: receiver1,
        });
      }
    });
    socket.on("send_message", async (data) => {
      const { sender, receiver, group: groupId, content, file } = data;
      //console.log("Message data received:", data);
      const sender1 = await user.findOne({ _id: sender });
      if (!sender1) {
        console.error("Sender not found");
        return;
      }
      if (groupId) {
        const group1 = await group
          .findOne({ _id: groupId })
          .populate("members", " username ");
        if (!group1) {
          console.error("Group not found");
          return;
        }
        const messageData: messageInterface = {
          sender,
          receiver,
          group: groupId,
          content,
          isRead: [
            {
              user: sender,
              readAt: new Date(),
            },
          ],
        };
        if (file) {
          const result = await addMedia(file);
          messageData.file = {
            type: file.type,
            name: file.name,
            link: result.url,
          };
        }
        const newMessage = new message(messageData);
        await newMessage.save();
        const populatedMessage = await message
          .findById(newMessage._id)
          .populate("sender", "_id username profilePicture");
        const members = group1.members.map((member: any) => member.username);
        if (!members || members.length === 0) {
          console.error("No members in the group");
          return;
        }
        members.forEach((member: string) => {
          if (sender1.username != member)
            io.to(member).emit("receive_message", {
              message: populatedMessage,
            });
          else
            socket.to(member).emit("receive_message", {
              message: populatedMessage,
            });
          io.to(member).emit("message_preview", {
            message: populatedMessage,
          });
        });
        return;
      } else {
        const messageData: messageInterface = {
          sender,
          receiver,
          content,
          isRead: [
            {
              user: sender,
              readAt: new Date(),
            },
          ],
        };
        if (file) {
          const result = await addMedia(file);
          messageData.file = {
            type: file.type,
            name: file.name,
            link: result.url,
          };
        }
        const newMessage = new message(messageData);
        await newMessage.save();
        const populatedMessage = await message
          .findById(newMessage._id)
          .populate("sender", "_id username profilePicture")
          .populate("receiver", "_id username profilePicture");
        const receiver1 = await user.findOne({ _id: receiver });
        if (!receiver1) {
          console.error("Receiver not found");
          return;
        }
        io.to(receiver1.username).emit("receive_message", {
          message: populatedMessage,
        });
        io.to(receiver1.username).emit("message_preview", {
          message: populatedMessage,
        });
        io.to(sender1.username).emit("message_preview", {
          message: populatedMessage,
        });
        socket.to(sender1.username).emit("receive_message", {
          message: populatedMessage,
        });
      }
    });

    socket.on("disconnect", async () => {
      map.set(socket.data.username, map.get(socket.data.username)! - 1);
      // console.log("A user disconnected:", socket.data.username);
      // console.log(
      //   `User ${socket.data.username} disconnected. Remaining connections: ${map.get(socket.data.username)}`
      // );
      if (map.get(socket.data.username)! <= 0) {
        map.delete(socket.data.username);
        await user.updateOne(
          { _id: socket.data._id },
          { $set: { isOnline: false } }
        );
        io.emit("user_status", {
          username: socket.data.username,
          isOnline: false,
        });
      }
    });
  });

  return io;
};
