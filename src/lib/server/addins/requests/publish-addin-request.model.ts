import { FileNameRecord } from "../../files/file-name.record";
import { RevitAddinXmlModel } from "../revit-addin-xml.model";

export interface PublishAddinRequest {
  revitAddinXml: RevitAddinXmlModel;
  revitVersions: string;
  dllFiles: FileNameRecord[];
}
