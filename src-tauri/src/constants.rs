use std::{future::Future, pin::Pin};

pub const APP_NAME: &str = "EmaAddinManager";
pub const ADDINS_REGISTRY_PATH: &str = "S:\\BasesRevitAddinsRegistry";

pub type Fut<'a, T> = Pin<Box<dyn Future<Output = T> + Send + 'a>>;
