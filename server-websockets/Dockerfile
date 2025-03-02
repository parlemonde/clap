FROM rust:1.85.0-slim

WORKDIR /usr/src/server-websockets
COPY src ./src
COPY Cargo.toml .

RUN cargo install --path .

CMD ["server-websockets"]
