import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {v2 as cloudinary} from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor(private readonly configService: ConfigService){
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUD_NAME'),
            api_key: this.configService.get<string>('API_KEY'),
            api_secret: this.configService.get<string>('API_SECRET'),
        })
    }

    async uploadImage(file: Express.Multer.File):Promise<string | null>{
        return new Promise((resolve, reject)=>{
            cloudinary.uploader.upload_stream({folder:'car_ads'}, (error, result)=>{
                if(error) return reject(error);
                resolve(result?.secure_url ?? null);
            })
            .end(file.buffer);
        })
    }
}
