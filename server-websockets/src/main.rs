use axum::{Router, extract::Query, response::IntoResponse, routing::get};
use fastwebsockets::{Frame, OpCode, Payload, WebSocketError, upgrade};
use futures_channel::mpsc::{UnboundedSender, unbounded};
use futures_util::{StreamExt, future, pin_mut};
use serde::Deserialize;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

enum Message {
    Text(String),
    Close,
}
type Tx = UnboundedSender<Message>;
type PeerMap = HashMap<Uuid, Tx>;
type RoomMap = HashMap<String, PeerMap>;

#[derive(Deserialize)]
struct QueryParameters {
    room: Option<String>,
}

#[tokio::main]
async fn main() {
    let state: Arc<Mutex<RoomMap>> = Arc::new(Mutex::new(HashMap::new()));
    let app = Router::new()
        .route(
            "/",
            get({
                let state = state.clone();
                move |ws: upgrade::IncomingUpgrade, params: Query<QueryParameters>| {
                    ws_handler(ws, params, state.clone())
                }
            }),
        )
        .route("/health_check", get(|| async { "Ok" }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:9000")
        .await
        .unwrap();
    println!("Listening on http://localhost:9000");
    axum::serve(listener, app).await.unwrap();
}

async fn handle_client(
    fut: upgrade::UpgradeFut,
    room_name: String,
    state: Arc<Mutex<RoomMap>>,
) -> Result<(), WebSocketError> {
    let mut ws = fut.await?;
    ws.set_auto_close(true);
    ws.set_auto_pong(false);
    let (ws_rx, mut ws_tx) = ws.split(tokio::io::split);
    let mut ws_rx = fastwebsockets::FragmentCollectorRead::new(ws_rx);
    let id = Uuid::new_v4();

    let (tx, mut rx) = unbounded::<Message>();

    // Add the client to the room. Use the lock and derived variables in a scope to unlock as soon as possible.
    {
        let mut room_map = state.lock().unwrap();
        let room = room_map
            .entry(room_name.clone())
            .or_default();
        room.insert(id, tx.clone());
    }

    let cloned_state = state.clone();
    let cloned_room_name = room_name.clone();
    let receive_handle = tokio::spawn(async move {
        while let Some(frame) = ws_rx
            .read_frame::<_, WebSocketError>(&mut move |_| async move { Ok(()) })
            .await
            .ok()
        {
            match frame.opcode {
                OpCode::Close => {
                    tx.unbounded_send(Message::Close).unwrap();
                    break;
                }
                OpCode::Text => {
                    let message = String::from_utf8(frame.payload.to_vec()).unwrap();
                    let room_map = cloned_state.lock().unwrap();
                    if let Some(peers) = room_map.get(&cloned_room_name) {
                        let broadcast_recipients = peers
                            .iter()
                            .filter(|(peer_id, _)| peer_id != &&id)
                            .map(|(_, tx)| tx);
                        for recipient in broadcast_recipients {
                            recipient.unbounded_send(Message::Text(message.clone())).unwrap();
                        }
                    }
                }
                _ => {}
            }
        }
    });

    let send_handle: tokio::task::JoinHandle<Result<(), WebSocketError>> =
        tokio::spawn(async move {
            while let Some(msg) = rx.next().await {
                match msg {
                    Message::Text(value) => {
                        ws_tx
                            .write_frame(Frame::text(Payload::from(value.as_bytes())))
                            .await?;
                    }
                    Message::Close => {
                        ws_tx
                            .write_frame(Frame::close(1000, b"End connection"))
                            .await?;
                        break;
                    }
                }
            }
            Ok(())
        });

    // Wait for either the receive or send handle to finish.
    pin_mut!(receive_handle, send_handle);
    future::select(receive_handle, send_handle).await;

    // Remove the client from the room.
    {
        let mut room_map = state.lock().unwrap();
        if let Some(room) = room_map.get_mut(&room_name) {
            room.remove(&id);

            // Remove the room if it is empty.
            if room.is_empty() {
                room_map.remove(&room_name);
            }
        }
    }

    Ok(())
}

async fn ws_handler(
    ws: upgrade::IncomingUpgrade,
    params: Query<QueryParameters>,
    state: Arc<Mutex<RoomMap>>,
) -> impl IntoResponse {
    let (response, fut) = ws.upgrade().unwrap();
    let room_name = params.room.clone().unwrap_or("None".to_string());

    tokio::task::spawn(async move {
        if let Err(e) = handle_client(fut, room_name, state).await {
            eprintln!("Error in websocket connection: {}", e);
        }
    });

    response
}
