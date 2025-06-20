import message from "../models/message.js";
import { Request, Response } from "express";
import user from "../models/user.js";
import { io } from "../index.js";
import { read } from "fs";
import ObjectID from "bson-objectid";

export const getMessages = async (req: Request, res: Response) => {
  const { sender, receiver } = req.query;
  //console.log("Sender:", sender, "Receiver:", receiver);
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
};

export const getUnreadCount = async (req: Request, res: Response) => {
  const { sender, receiver, readBy } = req.query;
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
};

export const markAsRead = async (req: Request, res: Response) => {
  const { sender, receiver, readBy } = req.query;
  if (!sender || !receiver || !readBy) {
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
        sender:receiver,
        receiver:sender,
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
    const user1 = await user.findOne({ _id: receiver });
    const user2 = await user.findOne({ _id: sender });
    if (!user1 || !user2) {
      res.status(404).send({ message: "User not found" });
      return;
    }
    const username1 = user1.username;
    const username2 = user2.username;
    // if (readBy == user1._id.toString())
    //   io.to(username2).emit("message_read", {
    //     sender,
    //     receiver,
    //   });
    // else
    //   io.to(username1).emit("message_read", {
    //     sender,
    //     receiver,
    //   });
    res.status(200).send({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
};
