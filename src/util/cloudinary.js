import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: "citybuzz",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploading images
const uploadOnCloudinary = async (localFilePaths) => {
  try {
    // checking if the local temp folder has any file
    if (!localFilePaths || localFilePaths.length == 0) {
      throw new ApiError(500, "No local file found to upload to cloudinary");
    }

    // upload localFilePath to cloudinary
    const uploadPromises = localFilePaths.map(async (localFile) => {
      return await cloudinary.uploader.upload(localFile, {
        resource_type: "auto",
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);

    // deleting the local file after successful upload
    if (uploadedImages) {
      localFilePaths.forEach((localFile) => fs.unlinkSync(localFile));
    }

    // file uploaded successfully
    return uploadedImages;
  } catch (error) {
    // remove the local temporary file if not uploaded to cloudinary
    // fs.unlinkSync(localFilePath);
    localFilePaths.forEach((localFile) => fs.unlinkSync(localFile));
    return `Error while uploading the file to cloudinary: ${error}`;
  }
};

export default uploadOnCloudinary;
