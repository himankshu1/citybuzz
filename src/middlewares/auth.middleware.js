import { User } from "../models/user.model";
import { ApiError } from "../util/ApiError";
import jwt from "jsonwebtoken";

// this will verify if the user is valid or not

export const verifyJWT = async (request, response, next) => {
  try {
    // handling if a custom header is being sent and the default cookie is not available in the request
    const accessToken =
      request.cookie?.accessToken ||
      request.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedAccessToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    request.user = user;

    next();
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong in auth middleware"
    );
  }
};
