import { Router } from "express";
import {
  getNotifications,
  deleteNotification,
} from "../controllers/notification.js";
import { RequestHandler } from "express";


const router = Router();

router.route("/getNotifications/:id").get(getNotifications as RequestHandler);
router
  .route("/deleteNotification/:id")
  .delete(deleteNotification as RequestHandler);

export default router;
