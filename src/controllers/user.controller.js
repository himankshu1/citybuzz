import { User } from "../models/user.model.js";

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
