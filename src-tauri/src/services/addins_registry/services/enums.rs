use std::fmt::Display;

#[derive(Debug)]
pub enum GetAddinsError {
    #[allow(dead_code)]
    LocalDbError(String),
    #[allow(dead_code)]
    RegistryNotFound(String),
    InvalidPath,
}
impl Display for GetAddinsError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "GetAddinsError: {:?}", self)
    }
}

#[derive(Debug)]
pub enum InstallAddinError {
    #[allow(dead_code)]
    InstallationError(String),
}
impl Display for InstallAddinError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "InstallAddinError: {:?}", self)
    }
}

#[derive(Debug)]
pub enum DelistAddinError {
    #[allow(dead_code)]
    LocalDbError(String),
    #[allow(dead_code)]
    DirectoryRecursionError(String),
}
impl Display for DelistAddinError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "DelistAddinError: {:?}", self)
    }
}

#[derive(Debug)]
pub enum AddCategoryError {
    #[allow(dead_code)]
    LocalDbError(String),
    #[allow(dead_code)]
    RegistryNotFound(String),
    InvalidPath,
    CategoryNotInsideRegistry,
    #[allow(dead_code)]
    FileError(std::io::Error),
}
impl Display for AddCategoryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "AddCategoryError: {:?}", self)
    }
}

#[derive(Debug)]
pub enum GetCategoriesError {
    #[allow(dead_code)]
    LocalDbError(String),
    #[allow(dead_code)]
    FileError(std::io::Error),
}
impl Display for GetCategoriesError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "GetCategoriesError: {:?}", self)
    }
}
