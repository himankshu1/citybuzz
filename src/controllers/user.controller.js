import { User } from "../models/user.model.js";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";

// helper function to generate access and refresh token at once
const generateAccessAndRefreshTokens = async (user) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // validateBeforeSave:false doesn't validate the schema and it just save the document to the mongodb
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

// register user
export const registerUser = async (request, response) => {
  try {
    // extract the request body data
    const { firstName, lastName, email, password, isOrganizer } = request.body;

    // validate - fields not empty
    if (
      [firstName, lastName, email, password, isOrganizer].some(
        (field) => field?.trim() === ""
      )
    ) {
      return response.status(400).send("All fields are required!");
    }

    if (!email.includes("@")) {
      return response.status(400).send("Invalid email!");
    }

    // validate - if user already exists (email)
    const isUserFound = await User.findOne({ email });

    if (isUserFound) {
      return response.status(409).send("User with email already exists!");
    }

    // create entry in db
    const createdUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      isOrganizer,
    });

    // console.log(createdUser);

    // cross check if the user has created successfully
    const verifiedCreatedUser = await User.findById(createdUser._id).select(
      "-password -refreshToken"
    );

    console.log(verifiedCreatedUser);

    if (!verifiedCreatedUser) {
      return response.status(500).send("Unable to create the user");
    }

    // generate refresh token
    const refreshToken = await createdUser.generateRefreshToken();
    console.log("Refresh token", refreshToken);

    // send the response (remove password and refresh token field)
    response.status(201).send(verifiedCreatedUser);
  } catch (error) {
    console.log("Error while registerung user: ", error);
    return response.status(400).send(error);
  }
};

// login user
export const loginUser = async (request, response) => {
  // get user data
  const { email, password } = request.body;

  // verify if email and password is not empty and valid email
  if (!email || !password) {
    throw new ApiError(400, "Email and password is required");
  }

  if (!email.includes("@")) {
    throw new ApiError(400, "Please validate the email");
  }

  // check if the user exists through email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "Email doesn't exists. Please signup");
  }

  // if exists, validate the password
  const isPasswordCorrect = await user.checkIfCorrectPassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Email or password is not correct");
  }

  // if validated, generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user
  );

  // send tokens in cookie
  // after the token are generated and saved into the db, we need to get the updated token from the db. so making a db call
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  // sending token in response apart from setting it in cookies, in case the frontend wants to use them for mobile applications or use it anywhere else
  return response
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User loggedin successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
};

// logout user
export const logoutUser = async (request, response) => {
  // get the loggedin user cookies (injected by auth middleware)
  const userId = request.user._id;

  User.findByIdAndUpdate(
    request.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  // delete cookie & the access/refresh token from db
  return response
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully", {}));
};
