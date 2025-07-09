use std::sync::Arc;

use serde::{de::DeserializeOwned, Serialize};
use tokio::sync::RwLock;

use crate::services::local_db::service::LocalDbService;

struct Inner<T>
where
    T: Serialize + Clone + DeserializeOwned + Default,
{
    data: T,
    serialized: serde_json::Value,
}

pub struct KvStoreValue<T>
where
    T: Serialize + Clone + DeserializeOwned + Default,
{
    inner: RwLock<Inner<T>>,
    /// If the value is bound to a certain key
    bounded_key: BoundedKey,
}

struct BoundedKey {
    pub key: String,
    pub db: Arc<LocalDbService>,
}

impl<T> KvStoreValue<T>
where
    T: Serialize + Clone + DeserializeOwned + Default,
{
    pub fn new(data: T, key: &str, local_db: Arc<LocalDbService>) -> Self {
        let serialized = serde_json::to_value(data.clone()).unwrap();
        Self {
            inner: RwLock::new(Inner { data, serialized }),
            bounded_key: BoundedKey {
                key: key.to_string(),
                db: local_db,
            },
        }
    }

    /// Initialized with T as its default value
    pub fn new_default(key: &str, local_db: Arc<LocalDbService>) -> Self {
        Self::new(T::default(), key, local_db)
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

    /// Only works if you initialized this instance with `new_with_key`, otherwise, this function will panic
    pub async fn get_data_updated(&self) -> Result<T, String> {
        self.bounded_key.db
            .kv_store_table()
            .refresh_value_key(&self.bounded_key.key, self)
            .await?;

        Ok(self.get_data().await)
    }

    /// Only works if you initialized this instance with `new_with_key`, otherwise, this function will panic
    ///
    /// This function will panic if there is an error accessing the database. Use get_data_updated for a non-panicking version.
    pub async fn data_updated(&self) -> T {
        self.get_data_updated()
            .await
            .expect("Failed to access updated KV data")
    }
}
