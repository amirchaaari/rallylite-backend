import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    const { userId } = client.handshake.query;
    console.log(`Client connected: ${client.id}, userId from query: ${userId}`);

    if (userId) {
      client.join(userId as string);
      console.log(`Client ${client.id} joined room: ${userId}`);
    } else {
      console.log(`Client ${client.id} connected without userId`);
    }
  }

  handleDisconnect(client: Socket) {
    const { userId } = client.handshake.query;
    console.log(`Client disconnected: ${client.id}, userId: ${userId}`);

    if (userId) {
      client.leave(userId as string);
      console.log(`Client ${client.id} left room: ${userId}`);
    }
  }

  // If you also want to handle 'joinRoom' event explicitly:
  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, userId: string) {
    console.log(`Received joinRoom event from client ${client.id} for room: ${userId}`);
    client.join(userId);
  }

  sendJoinRequestNotification(hostId: string, payload: any) {
    console.log(`Sending joinRequest notification to room: ${hostId}`, payload);
    this.server.to(hostId).emit('joinRequest', payload);
  }
}
