import { HelpTicketStatus } from "./help-ticket-status";

export interface HelpTicketPreviewModel {
  id: string;
  fromUser: string;
  title: string;
  forAddin: string;
  createdAt: string;
  status: HelpTicketStatus;
  assignedToUser: string | null;
}