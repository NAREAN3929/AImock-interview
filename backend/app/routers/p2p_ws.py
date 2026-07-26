import json
import logging
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/ws/p2p",
    tags=["P2P WebSockets"]
)

# In-memory storage for active connections in rooms
# Format: { "room_id": { websocket1, websocket2 } }
active_rooms: Dict[str, Set[WebSocket]] = {}

class ConnectionManager:
    def __init__(self):
        self.active_rooms = active_rooms

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = set()
        self.active_rooms[room_id].add(websocket)
        logger.info(f"Client connected to room {room_id}. Total clients: {len(self.active_rooms[room_id])}")

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_rooms and websocket in self.active_rooms[room_id]:
            self.active_rooms[room_id].remove(websocket)
            if len(self.active_rooms[room_id]) == 0:
                del self.active_rooms[room_id]
            logger.info(f"Client disconnected from room {room_id}.")

    async def broadcast_to_room(self, message: str, room_id: str, sender: WebSocket):
        if room_id in self.active_rooms:
            for connection in self.active_rooms[room_id]:
                if connection != sender:
                    try:
                        await connection.send_text(message)
                    except Exception as e:
                        logger.error(f"Error sending message to client in room {room_id}: {e}")

manager = ConnectionManager()

@router.websocket("/{room_id}")
async def p2p_signaling(websocket: WebSocket, room_id: str):
    """
    WebSocket endpoint for P2P WebRTC signaling.
    Clients connect to a specific room_id and exchange messages (offer, answer, ice-candidate).
    """
    await manager.connect(websocket, room_id)
    try:
        while True:
            # Receive text data from the client
            data = await websocket.receive_text()
            
            # Broadcast the signaling data to other peers in the room
            await manager.broadcast_to_room(data, room_id, sender=websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        # Notify others in the room about disconnection
        await manager.broadcast_to_room(
            json.dumps({"type": "peer-disconnected", "message": "A peer has left the room."}),
            room_id,
            sender=websocket
        )
    except Exception as e:
        logger.error(f"WebSocket Error in room {room_id}: {e}")
        manager.disconnect(websocket, room_id)
