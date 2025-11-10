use std::sync::Arc;

use serde::{de::DeserializeOwned, Serialize};
use tokio::sync::RwLock;

use crate::services::local_db::service::LocalDbService;

//
struct Inner<T>
where
    T: Serialize + Clone + DeserializeOwned + Default,
{
    data: T,
    serialized: serde_json::Value,
}

pub struct AutoSerializingValue<T>
where
    T: Serialize + Clone + DeserializeOwned + Default,
{
    inner: RwLock<Inner<T>>,
}

impl<T> Default for AutoSerializingValue<T>
where
    T: Serialize + Clone + DeserializeOwned + Default,
{
    fn default() -> Self {
        Self {
            inner: RwLock::new(Inner {
                data: T::default(),
                serialized: serde_json::Value::default(),
            }),
        }
    }
}

impl<T> AutoSerializingValue<T>
where
    T: Serialize + Clone + DeserializeOwned + Default,
{
    pub fn new(data: T) -> Self {
        let serialized = serde_json::to_value(data.clone()).unwrap();
        Self {
            inner: RwLock::new(Inner { data, serialized }),
        }
    }

    pub async fn set(&self, data: T) {
        let mut inner_lock = self.inner.write().await;
        inner_lock.data = data.clone();
        inner_lock.serialized = serde_json::to_value(data).unwrap();
    }

    /// Note: The data is not guaranteed to be updated
    pub async fn get_data(&self) -> T {
        let inner_lock = self.inner.read().await;
        inner_lock.data.clone()
    }

    /// Note: The data is not guaranteed to be updated
    pub async fn get_json(&self) -> serde_json::Value {
        let inner_lock = self.inner.read().await;
        inner_lock.serialized.clone()
    }
}
