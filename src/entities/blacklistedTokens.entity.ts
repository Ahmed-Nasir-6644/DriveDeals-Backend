import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('blacklisted_tokens')
export class BLTokens{
    @PrimaryGeneratedColumn({name: 'id', type: 'int'})
    id: number;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    created_at: Date;

    @UpdateDateColumn({name:'updated_at', type: 'timestamp'})
    updated_at: Date;

    @Column({name: 'accessToken', type: 'varchar', unique: true})
    accessToken: string;

    @Column({name: 'expires_at', type: 'bigint'})
    expires_at: number;

}