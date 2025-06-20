import { Router } from "express";
import { check } from "../middlewares/auth.js";
import { getMessages, getUnreadCount, markAsRead } from "../controllers/message.js";

const router = Router();

router.route("/getMessages").get( getMessages);
router.route("/getUnreadCount").get(check, getUnreadCount);
router.route("/markAsRead").post(check, markAsRead);

export default router;
