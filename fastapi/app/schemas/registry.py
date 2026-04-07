from pydantic import BaseModel


class CategoryResponse(BaseModel):
    name: str
    fullPath: str


class AddinResponse(BaseModel):
    pathToAddinXmlFile: str
    pathToAddinDllFolder: str
    name: str
    addinId: str
    version: str
    vendor: str
    email: str
    addinType: str
    vendorDescription: str
    revitVersion: str | None = None
    isInstalledLocally: bool = False
