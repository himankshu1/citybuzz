import mongoose from "mongoose";
import { validateEmail } from "../util/emailValidator.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "first name is required"],
    },
    lastName: String,
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      validate: {
        validator: validateEmail,
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    password: {
      type: String,
      required: [true, "password is required"],
      min: [8, "password must be minimum 8 characters"],
    },
    isOrganizer: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// PASSWORD HASHING
userSchema.pre("save", async function (next) {
  // checking if only the password field is modified
  if (!this.isModified("password")) {
    return next();
  }

  // hashing the password using bcrypt
  const salt = await bcrypt.genSalt(10);
  this.password = bcrypt.hash(this.password, salt);
  next();
});

// comparing the user password and db hashed password
// creating a method in the schema to use it later
userSchema.methods.checkIfCorrectPassword = async function (password) {
  return await bcrypt.compare(password, this.password); // returns true or false
};

// generating access token
userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// generating refresh token
userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
