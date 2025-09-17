import { MetadataBody, UserMetadataModel } from "../models/user-metadata.model";

export default function getMetadataBodyOrDefault(
  metadata: UserMetadataModel | undefined
): MetadataBody {
  if (!metadata || !metadata.body) {
    return {
      appVersion: "0.7.0 or lower",
    };
  }
  return metadata.body;
}
