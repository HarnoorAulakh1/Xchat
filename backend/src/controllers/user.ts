import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userInterface } from "../types.js";
import { createToken } from "../utils/jwt.js";
import user from "../models/user.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import message from "../models/message.js";

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: "Field is missing" });
    return;
  }
  const data: userInterface[] = await user.find({ username: username });
  const user1 = data[0];
  if (data.length === 0) {
    res.status(401).json({ message: "username is incorrect" });
    return;
  } else {
    if (!(await bcrypt.compare(password, user1.password))) {
      res.status(401).json({ message: "Password is incorrect" });
      return;
    }
  }
  res
    .cookie(
      "token",
      createToken({
        _id: user1._id,
        username: user1.username,
        password: "",
        email: user1.email,
        name: user1.name,
        profilePicture: user1.profilePicture,
        isOnline: user1.isOnline,
        groups: user1.groups || [], // Add default value for groups
      }),
      {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 1000 * 60 * 60),
      }
    )
    .status(200)
    .send(user1);
};

export const logout = async (req: Request, res: Response) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .send("Logged out");
};

export const register = async (req: Request, res: Response) => {
  const { email, password, username, name }: userInterface = req.body;
  const check = await user.find({
    $or: [{ email: email }, { username: username }],
  });
  if (check.length != 0) {
    res.status(409).send(JSON.stringify({ message: "User already exists" }));
    return;
  } else {
    try {
      const password_hashed = await bcrypt.hash(password, 10);
      const newUser = new user({
        email,
        password: password_hashed,
        username,
        name,
        isOnline: false,
      });
      if (req.file && req.file.path) {
        const local = req.file["path"];
        const result = await uploadToCloudinary(local);
        newUser.profilePicture = result.url;
      } else {
        newUser.profilePicture = "NULL";
      }
      await newUser.save();
      res
        .status(200)
        .send(JSON.stringify({ message: "User created successfully" }));
    } catch (e) {
      res
        .status(500)
        .send(JSON.stringify({ message: "Internal server errror" }));
    }
  }
};

export const checkLogin = async (req: Request, res: Response) => {
  const token =
    (req.cookies && req.cookies.token) ||
    (req.headers["authorization"]
      ? JSON.parse(req.headers["authorization"])["value"]
      : null);
  const secret: any = process.env.secret;
  try {
    if (!token) {
      res.status(401).send({ message: "No token" });
    } else {
      const data: any = jwt.verify(token, secret);
      res.status(200).send(data);
    }
  } catch (e) {
    res.status(401).send({ message: "Invalid token" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send({ message: "Username is required" });
    return;
  }
  try {
    const users: userInterface[] = await user.find({
      username: { $regex: id, $options: "i" },
    });
    if (users.length === 0) {
      res.status(404).send({ message: "Users not found" });
      return;
    }
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
};

export const getFriends = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send({ message: "User ID is required" });
    return;
  }
  try {
    const user1 = await user.findById(id).populate("friends");
    if (user1 && user1.friends) {
      res.status(200).send(user1.friends);
      return;
    }
    res.status(200).send([]);
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
};

export const getPreview = async (req: Request, res: Response) => {
  const { sender, receiver, group } = req.query;
  if (group) {
    if (!sender || !group) {
      res.status(400).send({ message: "Sender and group are required" });
      return;
    }
    try {
      const messages = await message
        .find({
          $or: [
            { sender, group },
            { sender: receiver, receiver: sender },
          ],
        })
        .sort({ created_at: -1 })
        .limit(1);
      if (messages.length > 0) {
        res.status(200).send(messages[0]);
      } else {
        res.status(200).send("No messages yet ...");
      }
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
        .sort({ created_at: -1 })
        .limit(1);
      if (messages.length > 0) {
        res.status(200).send(messages[0]);
      } else {
        res.status(200).send("No messages yet ...");
      }
    } catch (error) {
      res.status(500).send({ message: "Internal server error" });
    }
  }
};

export const isOnline = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send({ message: "User ID is required" });
    return;
  }
  try {
    const user1 = await user.findById(id);
    if (user1) {
      res.status(200).send({ isOnline: user1.isOnline });
      return;
    }
    res.status(404).send({ message: "User not found" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
};
