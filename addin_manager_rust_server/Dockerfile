FROM rust:1-bookworm AS build

WORKDIR /srv
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /srv
COPY --from=build /srv/target/release/addin_manager_rust_server /srv/addin_manager_rust_server
COPY assets ./assets

EXPOSE 8000

# Bind to the platform-provided $PORT (Render, Cloud Run, etc.), defaulting to
# 8000 for local Docker / docker compose. The binary reads PORT itself.
CMD ["sh", "-c", "export PORT=\"${PORT:-8000}\"; exec /srv/addin_manager_rust_server"]
