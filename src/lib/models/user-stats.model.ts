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

export function generateMockPublishedAddin(): PublishedAddinModel {
  return {
    addin: generateMockAddin(),
    datePublished: "2021-01-01",
  };
}

export function generateMockInstalledAddin(): InstalledAddinModel {
  return {
    addin: generateMockAddin(),
    dateInstalled: "2021-01-01",
  };
}

function generateMockAddin(): AddinModel {
  return {
    name: "Mock Addin",
    version: "1.0.0",
    pathToAddinXmlFile: "Mock Addin Path",
    pathToAddinDllFolder: "Mock Addin DLL Path",
    addinId: "Mock Addin ID",
    addinType: "Mock Addin Type",
    vendor: "Mock Vendor",
    email: "Mock Email",
    vendorDescription: "Mock Vendor Description",
    revitVersion: "Mock Revit Version",
    isInstalledLocally: true,
  };
}
