import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initSocket } from "./socket.js";
import http from "http";
import user from "./routes/user.js";
import notification from "./routes/notification.js";
import message from "./routes/message.js";
dotenv.config();

const app = express();
const server = http.createServer(app);

export const io=initSocket(server);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 8000;
const PORT2 = process.env.PORT2 || 3000;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://hoppscotch.io"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/user", user);
app.use("/message", message);
app.use("/notification", notification);
app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
