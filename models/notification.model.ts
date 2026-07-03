import { model, Schema, models } from "mongoose";

const notificationSchema = new Schema(
  {
    userTelegramId: String,
    isReaded: Boolean,
    message: String,
  },
  { timestamps: true }
);

const notificationModel =
  models.Notifications || model("Notifications", notificationSchema);

export default notificationModel;
