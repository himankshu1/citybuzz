import mongoose from "mongoose";
import { User } from "./user.model.js";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required!"],
      minLength: 10,
      maxLength: 50,
    },
    description: {
      type: String,
      minLength: 10,
      maxLength: 250,
      optional: true,
    },
    category: {
      type: String,
      required: [true, "event category is required"],
      index: true,
      enum: ["concert", "workshop", "meetup", "festive", "others"],
    },
    startDateTime: {
      type: Date,
      required: [true, "Event start date and time is required!"],
    },
    endDateTime: {
      type: Date,
      required: [true, "Event end date and time is required!"],
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
    },
    imageURL: {
      type: [], // cloudinary url
      optional: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "An event organizer is required"],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Event = mongoose.model("EventModel", eventSchema);
