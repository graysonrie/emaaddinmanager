import { AddinModel } from "./addin.model";

export interface UserStatsModel {
  userEmail: string;
  userName: string;
  publishedAddins: PublishedAddinModel[];
  installedAddins: InstalledAddinModel[];
  disciplines: string[];
}

export interface PublishedAddinModel {
  addin: AddinModel;
  datePublished: string;
}

export interface InstalledAddinModel {
  addin: AddinModel;
  dateInstalled: string;
}
