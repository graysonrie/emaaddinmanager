export interface AddHelpTicketMessageRequestModel {
  helpTicketId: string;
  message: string;
  fromUser: string;
  absoluteImagePaths: string[];
}
