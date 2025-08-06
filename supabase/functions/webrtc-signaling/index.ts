import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
};

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-room' | 'leave-room' | 'chat-message';
  data: any;
  roomId: string;
  userId: string;
  targetUserId?: string;
}

const rooms = new Map<string, Set<WebSocket>>();
const userRooms = new Map<WebSocket, { roomId: string; userId: string }>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    console.log("Client connected to signaling server");
  };

  socket.onmessage = (event) => {
    try {
      const message: SignalingMessage = JSON.parse(event.data);
      console.log("Received message:", message.type);

      switch (message.type) {
        case 'join-room':
          handleJoinRoom(socket, message);
          break;
        case 'leave-room':
          handleLeaveRoom(socket);
          break;
        case 'offer':
        case 'answer':
        case 'ice-candidate':
          handleWebRTCMessage(socket, message);
          break;
        case 'chat-message':
          handleChatMessage(socket, message);
          break;
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  socket.onclose = () => {
    handleLeaveRoom(socket);
    console.log("Client disconnected");
  };

  function handleJoinRoom(socket: WebSocket, message: SignalingMessage) {
    const { roomId, userId } = message;
    
    // Leave current room if any
    handleLeaveRoom(socket);
    
    // Join new room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    
    rooms.get(roomId)!.add(socket);
    userRooms.set(socket, { roomId, userId });
    
    // Notify other users in the room
    broadcastToRoom(roomId, {
      type: 'user-joined',
      data: { userId },
      roomId,
      userId
    }, socket);
    
    // Send current room members to the new user
    const roomMembers = Array.from(rooms.get(roomId)!)
      .map(ws => userRooms.get(ws)?.userId)
      .filter(id => id !== userId);
    
    socket.send(JSON.stringify({
      type: 'room-members',
      data: { members: roomMembers }
    }));
  }

  function handleLeaveRoom(socket: WebSocket) {
    const userRoom = userRooms.get(socket);
    if (userRoom) {
      const { roomId, userId } = userRoom;
      const room = rooms.get(roomId);
      
      if (room) {
        room.delete(socket);
        if (room.size === 0) {
          rooms.delete(roomId);
        } else {
          broadcastToRoom(roomId, {
            type: 'user-left',
            data: { userId },
            roomId,
            userId
          });
        }
      }
      
      userRooms.delete(socket);
    }
  }

  function handleWebRTCMessage(socket: WebSocket, message: SignalingMessage) {
    const userRoom = userRooms.get(socket);
    if (!userRoom) return;
    
    if (message.targetUserId) {
      // Send to specific user
      const targetSocket = findUserSocket(message.roomId, message.targetUserId);
      if (targetSocket) {
        targetSocket.send(JSON.stringify(message));
      }
    } else {
      // Broadcast to all users in room except sender
      broadcastToRoom(message.roomId, message, socket);
    }
  }

  function handleChatMessage(socket: WebSocket, message: SignalingMessage) {
    const userRoom = userRooms.get(socket);
    if (!userRoom) return;
    
    // Broadcast chat message to all users in room
    broadcastToRoom(message.roomId, {
      type: 'chat-message',
      data: {
        ...message.data,
        userId: userRoom.userId,
        timestamp: new Date().toISOString()
      },
      roomId: message.roomId,
      userId: userRoom.userId
    });
  }

  function broadcastToRoom(roomId: string, message: any, excludeSocket?: WebSocket) {
    const room = rooms.get(roomId);
    if (room) {
      room.forEach(ws => {
        if (ws !== excludeSocket && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      });
    }
  }

  function findUserSocket(roomId: string, userId: string): WebSocket | null {
    const room = rooms.get(roomId);
    if (room) {
      for (const socket of room) {
        const userRoom = userRooms.get(socket);
        if (userRoom?.userId === userId) {
          return socket;
        }
      }
    }
    return null;
  }

  return response;
});