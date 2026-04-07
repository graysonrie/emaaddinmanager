use std::path::Path;

mod db;
mod setup;

// Real registry: r"S:\\BasesRevitAddinsRegistry"
// Test Registry: r"C:\\Users\\grieger.EMA\\Favorites\\TEST_BasesRevitAddinsRegistry"

#[tokio::main]
async fn main() {
    let _real_registry = r"S:\\BasesRevitAddinsRegistry";
    let _test_registry = r"C:\\Users\\grieger.EMA\\Favorites\\TEST_BasesRevitAddinsRegistry";
    let db_dir = Path::new(_real_registry);
    match db::initialize(db_dir).await {
        Ok(()) => println!("Database setup complete"),
        Err(err) => eprintln!("Database setup failed: {}", err),
    }
}
