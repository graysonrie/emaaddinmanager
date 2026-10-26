---
name: register-seaorm-migration
description: >-
  Diffs addin_manager_rust_server SeaORM entities against the registered
  migrations and writes one new Postgres migration for that gap, then
  registers it on Migrator. Use when the user asks to add, generate, or
  register a migration, sync the schema from entity changes, or update the
  database after editing entities.
---

# Register a SeaORM migration

Migrations live in `addin_manager_rust_server/src/migration/`. Startup applies `Migrator::up` once per migration and records it in `seaql_migrations`. An applied migration never runs again. Editing an old migration does not change a database that already applied it.

The baseline `m20261012_000001_create_tables.rs` uses `if_not_exists`. Changing its `create_table` column list does not alter existing tables.

## Outcome

Leave the server with:

- Current entities in `addin_manager_rust_server/src/entities/` describing the desired schema.
- One new `mYYYYMMDD_HHMMSS_snake_name.rs` whose `up` brings a database that has applied every earlier migration in order onto that schema, and whose `down` reverses those statements.
- That module declared in `src/migration/mod.rs` and appended to the end of `Migrator::migrations`.

If there is no schema gap, stop. Do not add an empty migration.

## Diff

Previous schema = every module in `Migrator::migrations`, in order, including raw `ALTER` statements. Desired schema = the entity files as they are now.

Ignore non-schema edits (`Relation` boilerplate, `ActiveModelBehavior`, `allow` attributes, comments).

Also read `git diff` for `addin_manager_rust_server/src/entities` since the last commit that touched `addin_manager_rust_server/src/migration`, plus any uncommitted entity diff. Use that only to tell a rename from a drop plus an add. The migration list remains the previous schema even if git history disagrees.

If the user described a schema change that is not in the entities yet, update the entity first, then diff again. The migration and the entity must describe the same columns.

## Write the migration

Match `m20261012_000001_create_tables.rs`: `DeriveMigrationName`, `MigrationTrait`, `sea_orm_migration::prelude::*`, `sea_orm_migration::schema::*`, and a local `Iden` enum per table this file touches. The table variant is `Table`. Column variants are the PascalCase form of the database column. `#[sea_orm(column_name = "...")]` wins over the Rust field name.

Name the file with the current local time: `mYYYYMMDD_HHMMSS_short_snake_name`. If that name exists, increment the seconds. One migration for the whole gap.

Order inside `up`:

1. Create tables.
2. Rename tables, then rename columns.
3. Add columns.
4. Change types, nullability, and defaults.
5. Add indexes and foreign keys.
6. Drop columns, then drop tables.

`down` reverses that order and each operation.

New tables and columns in this migration do not use `if_not_exists`. The baseline is the only migration that adopts a pre-existing database.

Call `.take()` when a column builder returns a reference, as the baseline does for `.primary_key().take()`. Pass helpers such as `string(...)` and `json_binary(...)` by value when there is no further chain.

### Column helpers

This database stores JSON as `jsonb`. Map `Json` to `json_binary` / `json_binary_null`, and add `column_type = "JsonBinary"` on the entity when it is missing.

| Entity field | Helper |
| --- | --- |
| `String` primary key, `auto_increment = false` | `string(Col).primary_key().take()` |
| `String` | `string` |
| `Option<String>` | `string_null` |
| `Json` | `json_binary` / `json_binary_null` |
| `bool` / `Option<bool>` | `boolean` / `boolean_null` |
| `i32` primary key, `auto_increment = true` | `pk_auto` |
| `i32` / `Option<i32>` | `integer` / `integer_null` |
| `i64` / `Option<i64>` | `big_integer` / `big_integer_null` |
| `DateTimeWithTimeZone` | `timestamp_with_time_zone` |
| same, `default_expr = "Expr::current_timestamp()"` | `timestamp_with_time_zone_default_now` |

For any other Rust type, use the matching helper in `sea_orm_migration::schema` (`text`, `float`, `uuid`, and the `*_null` form). `unique` on a new column uses the `*_uniq` helper. `unique` added to an existing column uses `manager.create_index`.

### Defaults

A new `NOT NULL` column on an existing table must declare its default in the `ADD COLUMN` statement. Postgres will not fill existing rows otherwise.

- Entity has `default_expr`: put that expression in the `ADD`.
- `Expr::cust("'[]'::jsonb")` and other SQL expressions the helper cannot carry: `manager.get_connection().execute_unprepared(...)`, same style as the baseline's `SET DEFAULT`.
- Default-only change on an existing column: `ALTER TABLE ... ALTER COLUMN ... SET DEFAULT ...` or `DROP DEFAULT`.
- Non-null field with no `default_expr` on a table that already exists: stop. Do not invent a default. Tell the user which column needs a `default_expr` or an `Option` type.

Nullability-only changes are raw SQL: `ALTER COLUMN ... SET NOT NULL` or `DROP NOT NULL`. `modify_column` is for type changes. It emits `TYPE` (and `SET DEFAULT` when the column def has one). If a type change needs a `USING` cast and the cast is not obvious, stop and report the column instead of inventing a cast.

### Renames, drops, keys

Git shows a field or `table_name` rename, and the types still match: `rename_column` or `manager.rename_table`. `Table::rename().table(...).to_table(...).to_owned()`.

Git does not show a rename: treat a removed column and an added column as a drop and an add. Say that in the reply, because the drop discards stored values. `down` re-adds the old column with its previous type and nullability; it does not restore the data.

A change of which column is the primary key is not an `ALTER`. Stop and describe it. Do not rewrite the table.

`Relation` variants with `belongs_to` become a foreign key in the same migration. This server's entities currently have empty relations.

### Template

```rust
use sea_orm_migration::prelude::*;
use sea_orm_migration::schema::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(UserStats::Table)
                    .add_column(string(UserStats::AppVersion))
                    .to_owned(),
            )
            .await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(UserStats::Table)
                    .drop_column(UserStats::AppVersion)
                    .to_owned(),
            )
            .await?;
        Ok(())
    }
}

#[derive(Iden)]
enum UserStats {
    Table,
    AppVersion,
}
```

Include only the `Iden` variants this file uses. A new table follows the baseline `Table::create()` shape without `if_not_exists`.

## Register

In `src/migration/mod.rs`, add `mod mYYYYMMDD_HHMMSS_snake_name;` and append `Box::new(mYYYYMMDD_HHMMSS_snake_name::Migration)` as the last item of `migrations()`. Leave earlier entries in place.

## Finish

From `addin_manager_rust_server`, run `cargo check`. Fix call sites in that crate that no longer compile because an insert or active model is missing a new field. Use the entity's default when the column has one. Do not invent a business value.

Do not apply the migration to a database unless the user asks. Do not commit unless the user asks.

In the reply, name the new file and list each schema operation. Call out drops and type changes, including that a drop does not keep the old values.
