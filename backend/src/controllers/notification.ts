import { notification } from "../models/notifications.js";
import { Request, Response } from "express";

export const getNotifications = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    if (!id)
      res.status(400).send({ message: "params not found" });
    const data = await notification.find({ receiver: id });
    res.status(200).send(data);
  } catch (error) {
    //console.error("Error fetching notifications:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send({ message: "params not found" });
    return;
  }
  const data = await notification.findByIdAndDelete(id);
  if (!data) {
    res.status(404).send({ message: "Notification not found" });
    return;
  }
  res.status(200).send({ message: "Notification deleted successfully" });
};
