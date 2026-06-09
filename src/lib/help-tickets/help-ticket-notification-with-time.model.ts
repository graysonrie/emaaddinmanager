import { HelpTicketUpdateNotificationModel } from "@/lib/models/help-tickets/help-ticket-update-notification.model";

export interface HelpTicketNotificationWithTime
  extends HelpTicketUpdateNotificationModel {
  time: Date;
}
