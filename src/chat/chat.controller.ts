// src/chat/chat.controller.ts
import { Controller, Get, Post, Query, Body, ParseIntPipe } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Message } from "../entities/message.entity";

interface SendMessageDto {
  senderId: number;
  receiverId: number;
  text: string;
}

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Get conversation history between two users
   * Example request: GET /chat/history?user1=1&user2=2
   */
  @Get("history")
  async getConversation(
    @Query("user1", ParseIntPipe) user1: number,
    @Query("user2", ParseIntPipe) user2: number
  ): Promise<Message[]> {
    return this.chatService.getConversation(user1, user2);
  }

  /**
   * Send a message (REST endpoint for Vercel production compatibility)
   * POST /chat/send
   */
  @Post("send")
  async sendMessage(@Body() data: SendMessageDto): Promise<Message> {
    return this.chatService.saveMessage(data.senderId, data.receiverId, data.text);
  }

  /**
   * Optionally: get all chats of a specific user (recent conversations)
   * GET /chat/user-chats?userId=1
   */
  @Get("user-chats")
  async getUserChats(@Query("userId", ParseIntPipe) userId: number) {
    // This would return recent messages per conversation
    // You can implement a query grouping messages by conversation
    return this.chatService.getUserChats(userId);
  }
}
