import { Body, Controller, Get, Param, Post, ParseIntPipe, HttpCode, UseGuards, Request } from '@nestjs/common';
import { BidsService } from './bids.service';
import { jwtAuthGuard } from '../auth/jwt-auth.guard';
import * as jwt from 'jsonwebtoken';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

class CreateBidDto {
	@IsNumber()
	@IsNotEmpty()
	adId: number;

	@IsString()
	@IsNotEmpty()
	token: string;

	@IsNumber()
	@IsNotEmpty()
	amount: number;
}

@Controller('bids')
export class BidsController {
	constructor(private bidsService: BidsService) {}

	@Post('create')
	@HttpCode(201)
	async create(@Body() body: CreateBidDto) {
		try {
			const { adId, token, amount } = body;
			console.log("Creating bid with:", { adId, amount, tokenProvided: !!token });
			const created = await this.bidsService.createBid(Number(adId), token, Number(amount));
			return created;
		} catch (error) {
			console.error("Bid creation error:", error.message);
			throw error;
		}
	}

	@Get('get/byAd/:adId')
	async getByAd(@Param('adId', ParseIntPipe) adId: number) {
		return await this.bidsService.getBidsByAd(adId);
	}

	@UseGuards(jwtAuthGuard)
	@Get('getMyBids')
	async getMyBids(@Request() req) {
		// req.user.id is set by JwtAuthGuard
		return await this.bidsService.getAdsWithUserBidsByUserId(req.user.id);
	}
}
