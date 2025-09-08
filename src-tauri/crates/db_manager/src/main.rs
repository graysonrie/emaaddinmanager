use std::path::Path;

mod db;
mod setup;

#[tokio::main]
async fn main() {
    let db_dir = Path::new(r"S:\\BasesRevitAddinsRegistry");
    db::initialize(db_dir).await;
    println!("Database setup complete");
}
