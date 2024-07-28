import { Router } from "express";
import { addEvent } from "../controllers/event.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/add-event")
  .post(upload.fields([{ name: "imageURL", maxCount: 4 }]), addEvent);

export default router;
