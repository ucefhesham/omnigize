import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private connectedUsers: Map<string, string> = new Map();

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || 
                    client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      client.data.userId = userId;
      client.data.workspaceId = payload.workspaceId;
      this.connectedUsers.set(userId, client.id);

      client.join(`workspace:${payload.workspaceId}`);
      client.join(`user:${userId}`);

      this.logger.log(`Client ${client.id} connected as user ${userId}`);
    } catch (error) {
      this.logger.warn(`Client ${client.id} failed to authenticate`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`Client ${client.id} (user ${userId}) disconnected`);
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    this.logger.log(`Message received from ${client.id}: ${JSON.stringify(payload)}`);
    
    if (payload.to) {
      client.to(`user:${payload.to}`).emit('message', {
        from: client.data.userId,
        ...payload,
      });
    } else if (payload.workspace) {
      client.to(`workspace:${payload.workspace}`).emit('message', {
        from: client.data.userId,
        ...payload,
      });
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string): void {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string): void {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToWorkspace(workspaceId: string, event: string, data: any) {
    this.server.to(`workspace:${workspaceId}`).emit(event, data);
  }

  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }
}
