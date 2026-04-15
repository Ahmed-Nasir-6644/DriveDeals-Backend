import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Message } from '../entities/message.entity';
import { getCorsOrigin } from '../config/cors.config';

@WebSocketGateway({
  cors: {
    origin: getCorsOrigin(),
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  afterInit(server: Server) {
    console.log('Socket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  // ---------------- JOIN ROOM ----------------
  @SubscribeMessage('join_chat_room')
  handleJoinRoom(@MessageBody() chatId: string, @ConnectedSocket() client: Socket) {
    client.join(chatId);
    console.log(`Client ${client.id} joined room: ${chatId}`);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@MessageBody() chatId: string, @ConnectedSocket() client: Socket) {
    client.leave(chatId);
    console.log(`Client ${client.id} left room: ${chatId}`);
  }

  // ---------------- SEND MESSAGE ----------------
  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { senderId: number; receiverId: number; text: string; chatId: string },
    @ConnectedSocket() client: Socket, // get the sender's socket
  ) {
    // Save message to DB
    const message: Message = await this.chatService.saveMessage(
      data.senderId,
      data.receiverId,
      data.text,
    );

    // Emit to everyone in the room INCLUDING the sender
    this.server.to(data.chatId).emit('receive_message', message);
  }
}
