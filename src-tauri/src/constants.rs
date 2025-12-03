use std::{future::Future, pin::Pin};

pub const APP_NAME: &str = "EmaAddinManager";
pub const TEST_ADDINS_REGISTRY_PATH: &str =
    "C:\\Users\\grieger.EMA\\Favorites\\TEST_BasesRevitAddinsRegistry";
// TODO: ensure changed back
pub const ADDINS_REGISTRY_PATH: &str = "S:\\BasesRevitAddinsRegistry";

pub const TEMP_PASSWORD: &str = "temp1234";

pub type Fut<'a, T> = Pin<Box<dyn Future<Output = T> + Send + 'a>>;
