import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAdDto } from 'src/dtos/createAd.dto';
import { Ad } from 'src/entities/ad.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdsService {
    constructor(
        @InjectRepository(Ad) private readonly adRepository: Repository<Ad>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ){}


    async createAd(createAdDto: CreateAdDto, userId: number){
        const owner = await this.userRepository.findOne({where: {id:userId}});
        if(!owner) throw new Error("User not found");
        
        const ad = this.adRepository.create({...createAdDto, owner});
        return await this.adRepository.save(ad);
    }

    async getAdByOwner(id: number){
        const ads = await this.adRepository.find({
            where:{owner: {id:id}},
            order:{updated_at: 'DESC'},
            relations: ['owner', 'bids'],
        });

        return ads;
    }

    async getAdById(id: number){
        const ad =  await this.adRepository.findOne({where:{id},
            relations:['owner', 'bids'],
        });
        return ad;
    }
    async getAllAds(){
        const ads = await this.adRepository.find({
            order: {updated_at: 'DESC'},
            relations: ['owner','bids'],
        });
        return ads;
    }

    async deleteAd(id: number, userId: number){
        const ad = await this.adRepository.findOne({where:{id}, relations:['owner']});
        if(!ad) throw new NotFoundException('Ad not found');
        if(ad.owner.id !== userId) throw new ForbiddenException('Not authorized to delete this ad');

        await this.adRepository.remove(ad);
        return {message: 'Ad deleted successfully'};
    }

    async updatePrice(id: number, price: number, userId: number){
        const ad = await this.adRepository.findOne({where:{id}, relations:['owner']});
        if(!ad) throw new NotFoundException('Ad not found');
        if(ad.owner.id !== userId) throw new ForbiddenException('Not authorized to update this ad');
        
        ad.price = price;
        return await this.adRepository.save(ad);
    }
}
