from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.registry import AddinResponse, CategoryResponse
from app.services.registry_service import get_addins, get_categories

router = APIRouter()


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)) -> list[CategoryResponse]:
    return [CategoryResponse(name=row.name, fullPath=row.full_path) for row in get_categories(db)]


@router.get("/addins", response_model=list[AddinResponse])
def list_addins(db: Session = Depends(get_db)) -> list[AddinResponse]:
    rows = get_addins(db)
    return [
        AddinResponse(
            pathToAddinXmlFile=row.path_to_addin_xml_file,
            pathToAddinDllFolder=row.path_to_addin_dll_folder,
            name=row.name,
            addinId=row.addin_id,
            version=row.version,
            vendor=row.vendor,
            email=row.email,
            addinType=row.addin_type,
            vendorDescription=row.vendor_description,
            revitVersion=None,
            isInstalledLocally=False,
        )
        for row in rows
    ]
