use rocket::{response::Responder, response::Response, serde::json::Json};
use serde::ser::SerializeStruct;
use std::fmt::Display;

pub mod emit_metadata_model;
