import { HelpTicketStatus } from "./help-ticket-status";
import { HelpTicketMessageModel } from "./help-ticket-message.model";

// corresponds to the LoadedHelpTicket struct in the help_ticket_service crate
export interface HelpTicketModel {
  title: string;
  forAddin: string;
  openedByUser: string;
  assignedToUser: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  status: HelpTicketStatus;
  messages: HelpTicketMessageModel[];
}