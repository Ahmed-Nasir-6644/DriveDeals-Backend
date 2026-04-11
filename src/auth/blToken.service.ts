import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { BLTokens } from 'src/entities/blacklistedTokens.entity';

@Injectable()
export class BlTokenService {
  constructor(
    @InjectRepository(BLTokens)
    private blTokenRepository: Repository<BLTokens>,
  ) {}

  async add(token: string) {
    try {
      const decoded: any = jwt.decode(token);
      const expiresAt = decoded.exp * 1000;
      const entry = this.blTokenRepository.create({
        accessToken: token,
        expires_at: expiresAt,
      });
      await this.blTokenRepository.save(entry);
    } catch (error) {
      console.error('Failed to blacklist token: ', error);
    }
  }

  async isBlacklisted(token: string): Promise<boolean>{
    const tokenEntry = await this.blTokenRepository.findOne({where:{accessToken: token}});
    if(tokenEntry) return true;
    return false;
}
}
