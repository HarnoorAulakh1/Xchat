import { Request, Response } from "express";
import group from "../models/group.js";
import user from "../models/user.js";
import { io } from "../index.js";
import ObjectID from "bson-objectid";
import { notification } from "../models/notifications.js";

export const createGroup = async (req: Request, res: Response) => {
  const { name, admin, members } = req.body;
  if (!name || !admin) {
    res.status(400).json({ error: "Name and admin are required" });
    return;
  }
  const user1 = await user.findById(admin);
  if (!user || user1 == null) {
    res.status(404).json({ error: "Admin user not found" });
    return;
  }
  try {
    const groupData = {
      name,
      admin: [admin],
      logo: "NULL",
      members: [admin],
    };
    const group1 = new group(groupData);
    await group1.save();
    members.forEach(async (member: string) => {
      const user2 = await user.findById(member);
      if (!user2) {
        console.error(`User with ID ${member} not found`);
        return;
      }
      sendRequests({
        sender: admin,
        receiver: user2._id,
        group: group1._id,
      });
    });
    await user.findByIdAndUpdate(admin, {
      $push: { groups: group1._id },
    });
    io.to(user1.username).emit("add_group", {
      group: group1,
    });
    res.status(200).send(group1);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
};

export const getGroups = async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) {
    res.status(400).json({ error: "User ID is required" });
    return;
  }
  try {
    const groups = await user.findById(userId).populate("groups");
    if (groups && groups.groups) {
      res.status(200).json(groups.groups);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sendRequests = async (data: any) => {
  const { sender, receiver, group: groupId } = data;
  console.log("Group request data received:", data);
  const group1 = await group.findOne({ _id: groupId });
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
    group: groupId,
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
    group: groupId,
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
};
