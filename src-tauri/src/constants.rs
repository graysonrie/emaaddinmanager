use std::{future::Future, pin::Pin};

pub const APP_NAME: &str = "EmaAddinManager";

pub type Fut<'a, T> = Pin<Box<dyn Future<Output = T> + Send + 'a>>;
