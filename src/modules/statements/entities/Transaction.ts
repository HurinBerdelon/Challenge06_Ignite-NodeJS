import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid'
import { User } from '../../users/entities/User';
import { OperationType } from './Statement';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('uuid')
    sender_id: string;

    @ManyToOne(() => User, user => user.transaction)
    @JoinColumn({ name: 'sender_id' })
    sender: User;

    // @Column('uuid')
    // receiver_id: string;

    // @ManyToOne(() => User, user => user.transaction)
    // @JoinColumn({ name: 'receiver_id' })
    // receiver: User;

    @Column('decimal', { precision: 5, scale: 2 })
    amount: number;

    @Column()
    description: string;

    @Column({ type: 'enum', enum: OperationType })
    type: OperationType;

    @CreateDateColumn()
    created_at: Date;

    @CreateDateColumn()
    updated_at: Date;

    constructor() {
        if (!this.id) {
            this.id = uuidv4();
        }
    }
}