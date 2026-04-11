import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Bid } from 'src/entities/bid.entity';
import { Ad } from 'src/entities/ad.entity';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/mail/mail.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class BidsService {
	private readonly MIN_INCREMENT = 0.1;

		constructor(
			@InjectRepository(Bid)
			private bidRepository: Repository<Bid>,
			@InjectRepository(Ad)
			private adRepository: Repository<Ad>,
			private usersService: UsersService,
			private mailService: MailService,
			private configService: ConfigService,
		) {}

	/**
	 * Create a bid for the given adId. Validates ad exists and bid amount.
	 */
	async createBid(adId: number, user: string, amount: number) {
		try {
			const ad = await this.adRepository.findOne({ where: { id: adId },relations: { owner: true }, });
			if (!ad) throw new NotFoundException('Ad not found');
			
			// Check if the bidder is the ad owner
			console.log("Token received:", user);
			const jwtSecret = this.configService.get<string>('JWT_SECRET') || '6561';
			const decoded = jwt.verify(user, jwtSecret) as any;
			const userId = Number(decoded.sub);

			console.log("Decoded userId:", userId);

			if (ad.owner && ad.owner.id === userId) {
				throw new BadRequestException('Ad owners cannot bid on their own ads');
			}

			// find current highest bid for this ad
			const highest = await this.bidRepository
				.createQueryBuilder('bid')
				.leftJoin('bid.car', 'car')
				.where('car.id = :adId', { adId })
				.orderBy('bid.amount', 'DESC')
				.getOne();

			const minAllowed = (highest?.amount ?? 0) + this.MIN_INCREMENT;
			if (amount < minAllowed) throw new BadRequestException(`Bid too low. Minimum: ${minAllowed}`);
			
			const bid = this.bidRepository.create({
				amount,
				user: String(userId),
				car: ad,
			});

				const savedBid = await this.bidRepository.save(bid);

				// Notify ad owner and all bidders
			// 1. Get ad owner
			const ownerId = ad.owner?.id;
			let ownerEmail = '';
			if (ownerId) {
				const owner = await this.usersService.findById(ownerId);
				ownerEmail = owner?.email || '';
			}

			// 2. Get all unique userIds who have bid on this ad
			const allBids = await this.bidRepository.find({ where: { car: { id: adId } } });
			const userIds = Array.from(new Set(allBids.map(b => b.user)));

			// 3. Get emails for all bidders
			const bidderEmails: string[] = [];
			for (const uid of userIds) {
				const user = await this.usersService.findById(Number(uid));
				if (user?.email) bidderEmails.push(user.email);
			}

			// 4. Combine owner and bidders, deduplicate
			const notifyEmails = Array.from(new Set([ownerEmail, ...bidderEmails])).filter(Boolean);
			
			// 5. Send email to each
			for (const email of notifyEmails) {
				await this.mailService.sendNewBidNotification(
					email,
					adId,
					amount
				);
			}

			return savedBid;
		} catch (error) {
			console.error('Bid creation error:', error.message);
			if (error instanceof BadRequestException || error instanceof NotFoundException) {
				throw error;
			}
			throw new BadRequestException(error.message || 'Failed to create bid');
		}
	}

	/**
	 * Return bids for given adId sorted newest -> oldest (time desc)
	 */
	async getBidsByAd(adId: number) {
		const ad = await this.adRepository.findOne({ where: { id: adId } });
		if (!ad) throw new NotFoundException('Ad not found');

		const bids = await this.bidRepository
			.createQueryBuilder('bid')
			.leftJoin('bid.car', 'car')
			.where('car.id = :adId', { adId })
			.orderBy('bid.time', 'DESC')
			.getMany();

		// map to expected response format
		return bids.map((b) => ({
			user: b.user,
			amount: b.amount,
			time: b.time.toISOString(),
		}));
	}
	/**
	 * Return all ads where the user has placed at least one bid
	 */
		async getAdsWithUserBidsByUserId(userId: number) {
			// Find all bids by userId (assuming user field is email, so you may need to adjust this if you store userId)
			// If Bid.user is actually userId, use this:
			const bids = await this.bidRepository
				.createQueryBuilder('bid')
				.leftJoinAndSelect('bid.car', 'ad')
				.getMany();
			// Get unique ads from bids
			const adMap = new Map<number, Ad>();
			bids.forEach(bid => {
				if (bid.car) adMap.set(bid.car.id, bid.car);
			});
			return Array.from(adMap.values());
		}
}
