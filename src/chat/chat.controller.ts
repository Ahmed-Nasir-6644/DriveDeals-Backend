// src/chat/chat.controller.ts
import { Controller, Get, Query, ParseIntPipe } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Message } from "../entities/message.entity";

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
