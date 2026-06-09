export interface CreateHelpTicketRequestModel {
  title: string;
  forAddin: string;
  openedByUser: string;
  assignedToUser: string | null;
}