use rocket::{response::Responder, response::Response, serde::json::Json};
use serde::ser::SerializeStruct;
use std::fmt::Display;

pub mod emit_metadata_model;

pub enum FileContentType {
    Text,
    Png,
    Jpeg,
    FormData,
}

impl Display for FileContentType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            FileContentType::Text => write!(f, "text/plain"),
            FileContentType::Png => write!(f, "image/png"),
            FileContentType::Jpeg => write!(f, "image/jpeg"),
            FileContentType::FormData => write!(f, "multipart/form-data"),
        }
    }
}

/// Serializes to { type: String, bytes: Vec<u8>}
pub struct FileContent(pub FileContentType, pub Vec<u8>);
impl serde::Serialize for FileContent {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut s = serializer.serialize_struct("FileContent", 2)?;
        s.serialize_field("type", &self.0.to_string())?;
        s.serialize_field("bytes", &self.1)?;
        s.end()
    }
}

impl<'r> Responder<'r, 'static> for FileContent {
    fn respond_to(
        self,
        req: &rocket::Request<'_>,
    ) -> Result<Response<'static>, rocket::http::Status> {
        let json = Json(self);
        json.respond_to(req)
    }
}
