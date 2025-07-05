use std::fmt::Display;

#[derive(Debug)]
pub enum GetAddinsError {
    LocalDbError(String),
    RegistryNotFound,
    InvalidPath,
}
impl Display for GetAddinsError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "GetAddinsError: {:?}", self)
    }
}

#[derive(Debug)]
pub enum InstallAddinError {
    InstallationError(String),
}
impl Display for InstallAddinError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "InstallAddinError: {:?}", self)
    }
}

#[derive(Debug)]
pub enum DelistAddinError {
    LocalDbError(String),
    DirectoryRecursionError(String),
}
impl Display for DelistAddinError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "DelistAddinError: {:?}", self)
    }
}

#[derive(Debug)]
pub enum AddCategoryError {
    LocalDbError(String),
    RegistryNotFound,
    InvalidPath,
    CategoryNotInsideRegistry,
    FileError(std::io::Error),
}
impl Display for AddCategoryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "AddCategoryError: {:?}", self)
    }
}

#[derive(Debug)]
pub enum GetCategoriesError {
    LocalDbError(String),
    FileError(std::io::Error),
}
impl Display for GetCategoriesError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "GetCategoriesError: {:?}", self)
    }
}
