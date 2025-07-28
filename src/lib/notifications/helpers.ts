import { UpdateNotificationModel } from "../models/update-notification.model";

export function deduplicateAddinUpdateNotifications(
  notifications: UpdateNotificationModel[]
): UpdateNotificationModel[] {
  return notifications.filter(
    (notification, index, self) =>
      index === self.findIndex((t) => t.title === notification.title)
  );
}

