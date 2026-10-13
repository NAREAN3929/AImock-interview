from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

router = APIRouter(prefix="/ws", tags=["WebSockets Signaling"])

class ConnectionManager:
    def __init__(self):
        # Room Code -> List of WebSockets
        self.active_rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = []
        self.active_rooms[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_rooms:
            if websocket in self.active_rooms[room_id]:
                self.active_rooms[room_id].remove(websocket)
            if not self.active_rooms[room_id]:
                del self.active_rooms[room_id]

    async def broadcast_to_room(self, message: dict, room_id: str, sender: WebSocket):
        if room_id in self.active_rooms:
            for connection in self.active_rooms[room_id]:
                if connection != sender:
                    try:
                        await connection.send_json(message)
                    except Exception:
                        pass

manager = ConnectionManager()

@router.websocket("/p2p/{room_id}")
async def websocket_p2p_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    peer_count = len(manager.active_rooms.get(room_id, []))
    
    # Notify connecting peer of room size
    await websocket.send_json({
        "type": "room_joined",
        "room_id": room_id,
        "peer_count": peer_count
    })

    # Notify existing room members that a new peer joined
    await manager.broadcast_to_room({
        "type": "peer_connected",
        "peer_count": peer_count
    }, room_id, sender=websocket)

    try:
        while True:
            data = await websocket.receive_json()
            # Broadcast WebRTC offer/answer/ice-candidate/chat to other peer in room
            await manager.broadcast_to_room(data, room_id, sender=websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast_to_room({
            "type": "peer_disconnected",
            "peer_count": len(manager.active_rooms.get(room_id, []))
        }, room_id, sender=websocket)
