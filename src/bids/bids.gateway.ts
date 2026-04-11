import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BidsService } from './bids.service';
import { time } from 'console';
import { getCorsOrigin } from '../config/cors.config';

@WebSocketGateway({
  cors: {
    origin: getCorsOrigin(),
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class BidsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly bidsService: BidsService) {}

  handleConnection(client: Socket) {
    // connection established
    // could log or authenticate here if needed
    //log
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // cleanup if necessary
  }

  // client sends { adId: number }
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { adId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `ad_${data.adId}`;
    client.join(room);
    client.emit('joined', { room });
  }

  // client sends { adId, user, amount }
  @SubscribeMessage('place_bid')
  async handleNewBid(
    @MessageBody() data: { adId: number; user: string; amount: number; time: Date },
    @ConnectedSocket() client: Socket,
  ) {
    const { adId, user, amount } = data;

    try {
      const payload = {
        user: user,
        amount: amount,
        time: Date.now()
      };

      // broadcast to room if bid created (and therefore highest as per service rules)
      this.server.to(`ad_${adId}`).emit('new_bid', payload);

      return { status: 'ok', bid: payload };
    } catch (err: any) {
      // send error back to the sender
      client.emit('bid_error', { message: err?.message ?? 'Bid failed' });
      return { status: 'error', message: err?.message ?? 'Bid failed' };
    }
  }
}
