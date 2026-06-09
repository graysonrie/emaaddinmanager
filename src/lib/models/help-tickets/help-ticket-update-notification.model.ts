export type HelpTicketUpdateType =
  | "newReply"
  | "statusChanged"
  | "newTicket";

export interface HelpTicketUpdateNotificationModel {
  ticketId: string;
  ticketTitle: string;
  updateType: HelpTicketUpdateType;
  title: string;
  description: string;
  updatedAtExact: string;
}
