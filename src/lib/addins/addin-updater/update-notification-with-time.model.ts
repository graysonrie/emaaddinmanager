import { UpdateNotificationModel } from "@/lib/models/update-notification.model";

export interface UpdateNotificationWithTime extends UpdateNotificationModel {
  time: Date;
}
