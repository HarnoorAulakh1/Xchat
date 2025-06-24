import { Router } from "express";
//import { upload } from "../utils/multer.js";
import {check} from "../middlewares/auth.js";
import { createGroup } from "../controllers/group.js";
import { getGroups } from "../controllers/group.js";
const router = Router();

router.route("/createGroup").post(check, createGroup);
router.route("/getGroups").get(check, getGroups);
export default router;