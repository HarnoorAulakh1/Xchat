import { writeFile } from "fs";
import { uploadToCloudinary } from "./cloudinary.js";

export async function addMedia(file: {
  type: string;
  name: string;
  link: string;
}) {
  if (
    file != null &&
    file != undefined &&
    file.name != "" &&
    file.name != undefined &&
    file.type != "" &&
    file.type != undefined
  ) {
    const upload = addFile(file);
    const result = await uploadToCloudinary(upload, file.type);
    const file1 = {
      type: file.type,
      link: result.url,
      name: file.name,
    };
    return result;
  }
  return { message: "File not found", url: "" };
}

export function addFile(file: any) {
  const path =
    "src/uploads/" +
    file.name;
  writeFile(path, file.link, (err: any) => {
    if (err) console.log(err);
  });
  return path;
}
