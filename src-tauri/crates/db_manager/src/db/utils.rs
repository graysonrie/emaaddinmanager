use sea_orm::{Schema, prelude::*};

/// Ignores benign "already exists" errors and surfaces other failures.
pub async fn generate_table_lenient<E>(db: &DatabaseConnection, entity: E) -> Result<(), String>
where
    E: EntityTrait,
{
    if let Err(err) = generate_table(db, entity).await {
        let err_text = err.to_string();
        if !err_text.contains("already exists") {
            return Err(err_text);
        }
    }
    Ok(())
}

pub async fn generate_table<E>(
    db: &DatabaseConnection,
    entity: E,
) -> Result<sea_orm::ExecResult, sea_orm::DbErr>
where
    E: EntityTrait,
{
    let builder = db.get_database_backend();
    let create_table = Schema::new(builder).create_table_from_entity(entity);

    db.execute(builder.build(&create_table)).await
}
