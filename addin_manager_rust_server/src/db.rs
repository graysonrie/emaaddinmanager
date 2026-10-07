use sea_orm::ConnectOptions;
use sea_orm::{
    ConnectionTrait, Database, DatabaseConnection, DbBackend, DbErr, EntityTrait, Schema,
};

use crate::entities::{login_info, seed_metadata, user_addins, user_metadata, user_stats};

pub async fn connect(database_url: &str) -> Result<DatabaseConnection, DbErr> {
    let mut options = ConnectOptions::new(database_url.to_owned());
    options.test_before_acquire(true).sqlx_logging(false);
    Database::connect(options).await
}

pub async fn create_tables(db: &DatabaseConnection) -> Result<(), DbErr> {
    let schema = Schema::new(DbBackend::Postgres);
    create_table(db, &schema, user_stats::Entity).await?;
    create_table(db, &schema, user_addins::Entity).await?;
    create_table(db, &schema, user_metadata::Entity).await?;
    create_table(db, &schema, login_info::Entity).await?;
    create_table(db, &schema, seed_metadata::Entity).await?;

    db.execute_unprepared(
        "ALTER TABLE user_addins ALTER COLUMN blocked_addin_paths SET DEFAULT '[]'::jsonb",
    )
    .await?;
    db.execute_unprepared("ALTER TABLE seed_metadata ALTER COLUMN seeded_at SET DEFAULT now()")
        .await?;
    Ok(())
}

async fn create_table<E>(db: &DatabaseConnection, schema: &Schema, entity: E) -> Result<(), DbErr>
where
    E: EntityTrait,
{
    let mut statement = schema.create_table_from_entity(entity);
    statement.if_not_exists();
    db.execute(&statement).await?;
    Ok(())
}
