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
            timeout: 20000, // 20 second timeout for uploads
        })
    }

    async uploadImage(file: Express.Multer.File, timeoutMs: number = 20000):Promise<string | null>{
        return new Promise((resolve, reject)=>{
            // Set a timeout to prevent hanging
            const timeout = setTimeout(() => {
                reject(new Error('Image upload timeout'));
            }, timeoutMs);

            cloudinary.uploader.upload_stream({folder:'car_ads'}, (error, result)=>{
                clearTimeout(timeout);
                if(error) return reject(error);
                resolve(result?.secure_url ?? null);
            })
            .on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            })
            .end(file.buffer);
        })
    }
}
