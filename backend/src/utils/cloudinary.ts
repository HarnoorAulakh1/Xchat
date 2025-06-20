import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { writeFile } from "fs/promises";

import { extractPublicId } from "cloudinary-build-url";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export async function uploadToCloudinary(locaFilePath: string,type?:string) {
  //console.log("localFilePath :: ", locaFilePath);
  return cloudinary.uploader
    .upload(locaFilePath, {
      resource_type: type === "pdf" ? "image" : "auto", 
      format: type === "pdf" ? "jpg" : undefined, 
      page: type === "pdf" ? 1 : undefined,
      folder: "commute/uploads",
      use_filename: true,
    })
    .then((result) => {
      fs.unlinkSync(locaFilePath);

      return {
        message: "Success",
        url: result.url,
      };
    })
    .catch((error) => {
      fs.unlinkSync(locaFilePath);
      console.log(error.message);
      return { message: "Fail",url:"" };
    });
}

export const deleteFromCloudinary = async (fileToDelete: string) => {
  const publicId = extractPublicId(fileToDelete);
  return cloudinary.uploader.destroy(publicId, (error, result) => {
    console.log("result :: ", result);
  });
};


