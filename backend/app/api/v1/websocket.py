from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List, Set
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Room ID (document_id) -> List of WebSockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Track user info per connection for cursors
        self.user_info: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_data: dict):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = set()
        self.active_connections[room_id].add(websocket)
        self.user_info[websocket] = user_data
        
        # Notify others in the room that a new user joined
        await self.broadcast(room_id, {
            "type": "presence",
            "action": "join",
            "user": user_data
        }, exclude=websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
        
        user_data = self.user_info.pop(websocket, None)
        return user_data

    async def broadcast(self, room_id: str, message: dict, exclude: WebSocket = None):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if connection != exclude:
                    try:
                        await connection.send_json(message)
                    except:
                        # Handle broken connections
                        pass

manager = ConnectionManager()

@router.websocket("/ws/docs/{document_id}")
async def document_websocket(
    websocket: WebSocket, 
    document_id: str, 
    user_email: str = "Anonymous"
):
    user_data = {"email": user_email, "id": str(id(websocket))}
    await manager.connect(websocket, document_id, user_data)
    
    try:
        while True:
            # Receive message from client (could be text update or cursor move)
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Broadcast to everyone else in the same document room
            await manager.broadcast(document_id, message, exclude=websocket)
            
    except WebSocketDisconnect:
        user_data = manager.disconnect(websocket, document_id)
        await manager.broadcast(document_id, {
            "type": "presence",
            "action": "leave",
            "user": user_data
        })
