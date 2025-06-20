import { Router, RequestHandler } from "express";
import {
  login,
  register,
  checkLogin,
  logout,
  getUser,
  getFriends,
  getPreview,
  isOnline,
} from "../controllers/user.js";
import { upload } from "../utils/multer.js";

const router = Router();

router.route("/login").post(login as RequestHandler);
router
  .route("/register")
  .post(upload.single("profilePicture"), register as RequestHandler);
router.route("/checkLogin").post(checkLogin as RequestHandler);
router.route("/logout").post(logout as RequestHandler);
router.route("/getUsers/:id").get(getUser as RequestHandler);
router.route("/getFriends/:id").get(getFriends as RequestHandler);
router.route("/getPreview").get(getPreview as RequestHandler);
router.route("/isOnline/:id").get(isOnline as RequestHandler);
export default router;
