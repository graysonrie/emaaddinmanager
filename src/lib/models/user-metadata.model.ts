export interface UserMetadataModel {
  userEmail: string;
  body: MetadataBody;
}

export interface MetadataBody {
  appVersion: string | undefined;
}
