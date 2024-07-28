import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const PORT = process.env.PORT || 3000;

// middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import eventRouter from "./routes/event.routes.js";

// route declaration
app.use("/api/v1/user", userRouter);
app.use("/api/v1/event", eventRouter);

// mongodb connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Connected to MongoDB. Server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`failed to connect to MongoDB ${err}`);
    process.exit(1);
  });
