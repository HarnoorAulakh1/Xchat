import message from "../models/message.js";
import { Request, Response } from "express";
import user from "../models/user.js";
import group from "../models/group.js";
import { io } from "../index.js";
import ObjectID from "bson-objectid";

export const getMessages = async (req: Request, res: Response) => {
  const { sender, receiver, group } = req.query;
  if (group) {
    if (!sender || !group) {
      res.status(400).send({ message: "Sender is required" });
    }
    try {
      const messages = await message
        .find({ group })
        .sort({ created_at: 1 })
        .populate("sender", "_id username profilePicture");
      res.status(200).send(messages);
    } catch (error) {
      res.status(500).send({ message: "Internal server error" });
    }
  } else {
    if (!sender || !receiver) {
      res.status(400).send({ message: "Sender and receiver are required" });
      return;
    }
    try {
      const messages = await message
        .find({
          $or: [
            { sender, receiver },
            { sender: receiver, receiver: sender },
          ],
        })
        .sort({ created_at: 1 })
        .populate("sender", "_id username profilePicture")
        .populate("receiver", "_id username profilePicture");
      res.status(200).send(messages);
    } catch (error) {
      res.status(500).send({ message: "Internal server error" });
    }
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  const { sender, receiver, readBy,group } = req.query;
  if( group) {
    try {
    const count1 = await message.countDocuments({
      group,
      isRead: {
        $not: {
          $elemMatch: {
            user: ObjectID(readBy as string),
            readAt: { $exists: true },
          },
        },
      },
    });
    res.status(200).send({ count: count1 });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
  }
  else{
  if (!sender || !receiver) {
    res.status(400).send({ message: "Sender and receiver are required" });
    return;
  }
  try {
    const count1 = await message.countDocuments({
      sender,
      receiver,
      isRead: {
        $not: {
          $elemMatch: {
            user: ObjectID(readBy as string),
            readAt: { $exists: true },
          },
        },
      },
    });
    const count2 = await message.countDocuments({
      sender: receiver,
      receiver: sender,
      isRead: {
        $not: {
          $elemMatch: {
            user: ObjectID(readBy as string),
            readAt: { $exists: true },
          },
        },
      },
    });
    res.status(200).send({ count: count1 + count2 });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
}
};

export const markAsRead = async (req: Request, res: Response) => {
  const { sender, receiver, readBy, time, group: groupId } = req.query;
  if (groupId) {
    try {
      await message.updateMany(
        {
          group: groupId,
          isRead: {
            $not: {
              $elemMatch: {
                user: ObjectID(readBy as string),
                readAt: { $exists: true },
              },
            },
          },
          created_at: {
            $lte: new Date(time as string),
          },
        },
        {
          $push: {
            isRead: {
              user: readBy,
              readAt: new Date(),
            },
          },
        }
      );
      const data = await group
        .findOne({ _id: groupId })
        .populate("members", "_id username");
      const members = data?.members || [];
      members.forEach((member: any) => {
        if (member._id.toString() !== readBy) {
          io.to(member.username).emit("message_read", {
            group: groupId,
            time,
          });
        }
      });
      res.status(200).send({ message: "Messages marked as read" });
    } catch (error) {
      res.status(500).send({ message: "Internal server error" });
    }
    return;
  } else {
    if (!sender || !receiver ||  !readBy) {
    res.status(400).send({ message: "Sender and receiver are required" });
    return;
  }
    try {
      await message.updateMany(
        {
          sender,
          receiver,
          isRead: {
            $not: {
              $elemMatch: {
                user: ObjectID(readBy as string),
                readAt: { $exists: true },
              },
            },
          },
          created_at: {
            $lte: new Date(time as string),
          },
        },
        {
          $push: {
            isRead: {
              user: readBy,
              readAt: new Date(),
            },
          },
        }
      );
      await message.updateMany(
        {
          sender: receiver,
          receiver: sender,
          isRead: {
            $not: {
              $elemMatch: {
                user: ObjectID(readBy as string),
                readAt: { $exists: true },
              },
            },
          },
        },
        {
          $push: {
            isRead: {
              user: readBy,
              readAt: new Date(),
            },
          },
        }
      );
      const user1 = await user.findOne({ _id: sender });
      const user2 = await user.findOne({ _id: receiver });
      const username1 = user1?.username;
      const username2 = user2?.username;
      if (readBy == user2?._id.toString() && username1) {
        console.log("Emitting message_read event to:", username1);
        io.to(username1).emit("message_read", {
          sender,
          receiver,
          time,
        });
      } else if (readBy == user1?._id.toString() && username2) {
        io.to(username2).emit("message_read", {
          sender,
          receiver,
          time,
        });
      }
      res.status(200).send({ message: "Messages marked as read" });
    } catch (error) {
      res.status(500).send({ message: "Internal server error" });
    }
  }
};
