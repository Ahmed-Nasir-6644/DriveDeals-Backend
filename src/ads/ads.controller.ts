import { Body, Controller, Delete, Get, Param, Post, Patch, Req, UploadedFiles, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { CreateAdDto } from '../dtos/createAd.dto';
import { AdsService } from './ads.service';
import { jwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('ads')
export class AdsController {
    constructor(private readonly adsService: AdsService,
        private readonly cloudinaryService: CloudinaryService,
    ){}
    
    @UseGuards(jwtAuthGuard)
    @Post('post-ad')
    @UseInterceptors(FilesInterceptor('files'))
    async postAd(
        @Body() createAdDTO: CreateAdDto, @Req() req,
        @UploadedFiles() files: Express.Multer.File[],
    ){
        const userId = req.user.userId;

        // Validate file count
        if (files && files.length > 10) {
            throw new BadRequestException('Maximum 10 images allowed');
        }

        if(!createAdDTO.images){
            createAdDTO.images = [];
        }

        // Upload all images in parallel instead of sequentially
        if (files && files.length > 0) {
            try {
                const uploadPromises = files.map(file => 
                    this.cloudinaryService.uploadImage(file)
                        .catch(err => {
                            console.error('Image upload failed:', err);
                            return null;
                        })
                );
                const urls = await Promise.all(uploadPromises);
                
                // Filter out null values and add to images array
                const validUrls = urls.filter(url => url !== null);
                createAdDTO.images?.push(...validUrls);
            } catch (error) {
                console.error('Error uploading images:', error);
                throw new BadRequestException('Failed to upload images');
            }
        }

        const ad = await this.adsService.createAd(createAdDTO, userId);
        return ad;
    }

    @UseGuards(jwtAuthGuard)
    @Get('get/adsByOwner')
    async getAdByOwner(@Req() req){
        const userId = req.user.userId;
        const ads  = await this.adsService.getAdByOwner(userId);
        return ads;
    }


    @Get('get/adById/:id')
    async getAsById(@Param('id') id: number){
        let ad = await this.adsService.getAdById(id);
        return ad;
    }


    @Get('get/ads')
    async getAllAds(){
        return await this.adsService.getAllAds();
    }

    @UseGuards(jwtAuthGuard)
    @Delete('delete/:id')
    async deleteAd(@Param('id') id: number, @Req() req){
        const userId = req.user.userId;
        return await this.adsService.deleteAd(id, userId);
    }

    @UseGuards(jwtAuthGuard)
    @Patch('update-price/:id')
    async updatePrice(
        @Param('id') id: number,
        @Body() body: { price: number },
        @Req() req
    ){
        const userId = req.user.userId;
        const ad = await this.adsService.updatePrice(id, body.price, userId);
        return ad;
    }

}
