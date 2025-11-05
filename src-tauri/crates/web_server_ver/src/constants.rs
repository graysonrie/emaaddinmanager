use std::{future::Future, pin::Pin};

pub const TEST_ADDINS_REGISTRY_PATH: &str =
    "C:\\Users\\grieger.EMA\\Favorites\\TEST_BasesRevitAddinsRegistry";
// TODO: ensure changed back
pub const ADDINS_REGISTRY_PATH: &str = "S:\\BasesRevitAddinsRegistry";

pub type Fut<'a, T> = Pin<Box<dyn Future<Output = T> + Send + 'a>>;
