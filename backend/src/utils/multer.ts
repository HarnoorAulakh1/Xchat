import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("src/uploads")); // Resolves to absolute path
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
export const upload = multer({ storage: storage });
