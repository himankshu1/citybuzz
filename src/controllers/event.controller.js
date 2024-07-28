import { ApiError } from "../util/ApiError.js";
import uploadOnCloudinary from "../util/cloudinary.js";
import { Event } from "../models/event.model.js";
import { ApiResponse } from "../util/ApiResponse.js";

export const addEvent = async (request, response) => {
  // create event in db

  // get event details from request body
  const {
    title,
    description,
    category,
    startDateTime,
    endDateTime,
    location,
    imageURL,
    organizer,
    isPublic,
  } = request.body;

  // check if all the required attributes are present
  if (
    [
      title,
      description,
      category,
      startDateTime,
      endDateTime,
      location,
      imageURL,
      organizer,
      isPublic,
    ].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Please check all fields");
  }

  // get the local file paths
  const imageLocalPaths = request.files?.imageURL.map((image) => image?.path);

  // upload event images from local path to cloudinary and verify if uploaded
  const uploadedImagesArray = await uploadOnCloudinary(imageLocalPaths);

  const uploadedImagesPathArray = uploadedImagesArray.map(
    (uploadedImage) => uploadedImage.url
  );
  console.log(uploadedImagesPathArray);

  const createdEvent = await Event.create({
    title,
    description,
    category: category.toLowerCase(),
    startDateTime,
    endDateTime,
    location,
    imageURL: uploadedImagesPathArray,
    organizer: organizer || "",
    isPublic,
  });

  if (!createdEvent) {
    throw new ApiError(500, "Couldn't create the event. Please try again!");
  }

  return response
    .status(201)
    .json(new ApiResponse(200, "Event created successfully", createdEvent));
};
