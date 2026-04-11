// src/chat/chat.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private mailService: MailService,
  ) {}

  // Save message, lookup users, send email notification to receiver
  async saveMessage(
    senderId: number,
    receiverId: number,
    texts: string,
  ): Promise<Message> {
    // Validate users exist
    const sender = await this.userRepo.findOne({
      where: { id: senderId },
    });
    const receiver = await this.userRepo.findOne({
      where: { id: receiverId },
    });

    if (!sender)
      throw new NotFoundException(
        `Sender with id ${senderId} not found`,
      );
    if (!receiver)
      throw new NotFoundException(
        `Receiver with id ${receiverId} not found`,
      );

    // Create & save message with explicit current timestamp
    const message = this.messageRepo.create({
      senderId: senderId,
      receiverId: receiverId,
      text: texts,
      created_at: new Date(), // Explicitly set current time
    });

    const saved = await this.messageRepo.save(message);

    // Prepare email content (simple plain text or HTML as you prefer)
    const subject = `New message on Drive Deals from ${sender.first_name ?? sender.email}`;
    const text = `You have received a new message from ${sender.first_name ?? sender.email}:\n\n"${texts}"\n\nOpen Drive Deals to view the messge.`;

    // Send email to receiver
    try {
      await this.mailService.sendMail(receiver.email, subject, text);
    } catch (err) {
      // Log error but don't block return of saved message
      console.error('Failed to send notification email:', err);
    }

    return saved;
  }

  // Fetch conversation history between two users (optional)
  async getConversation(user1: number, user2: number) {
    return await this.messageRepo.find({
      where: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
      order: { created_at: 'ASC' },
    });
  }

  async getUserChats(userId: number) {
    const result = await this.messageRepo
      .createQueryBuilder('msg')
      .where('msg.senderId = :userId OR msg.receiverId = :userId', { userId })
      .orderBy('msg.created_at', 'DESC')
      .getMany(); // You can improve this with DISTINCT / grouping per conversation'

      console.log(result)
      return result;
  }
}
