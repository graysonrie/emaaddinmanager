export type UpdateNotificationType = "info" | "install" | "warning";

export interface UpdateNotificationModel {
  title: string;
  description: string;
  notificationType: UpdateNotificationType;
}
