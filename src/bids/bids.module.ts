import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { BidsGateway } from './bids.gateway';
import { Bid } from 'src/entities/bid.entity';
import { Ad } from 'src/entities/ad.entity';
import { UsersModule } from '../users/users.module'; // <-- import UsersModule
import { MailModule } from '../mail/mail.module'; // <-- import MailModule

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Ad]), UsersModule, MailModule],
  providers: [BidsService, BidsGateway],
  controllers: [BidsController],
})
export class BidsModule {}
