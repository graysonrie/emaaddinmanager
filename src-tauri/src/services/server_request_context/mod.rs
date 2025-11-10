// ? Put things like cookies in here?
pub struct ServerRequestContext {}

impl ServerRequestContext {
    pub fn new() -> Self {
        Self
    }
    pub async fn request<T, E>(&self, body: serde_json::Value) -> Result<T, E> {
        todo!()
    }
}
