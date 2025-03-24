import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Store } from './Store';

export enum ReviewType {
    USER = 'user',
    STORE = 'store',
}

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: ReviewType,
    })
    type: ReviewType;

    @Column({ type: 'decimal', precision: 3, scale: 1 })
    rating: number;

    @Column({ type: 'text', nullable: true })
    comment: string | null;

    @Column({ default: false })
    is_flagged: boolean;

    @ManyToOne(() => User, (user) => user.reviews_given)
    @JoinColumn({ name: 'reviewer_id' })
    reviewer: User;

    @Column()
    reviewer_id: string;

    @ManyToOne(() => User, (user) => user.reviews_received, { nullable: true })
    @JoinColumn({ name: 'subject_id' })
    subject: User | null;

    @Column({ nullable: true })
    subject_id: string | null;

    @ManyToOne(() => Store, (store) => store.reviews, { nullable: true })
    @JoinColumn({ name: 'store_id' })
    store: Store | null;

    @Column({ nullable: true })
    store_id: string | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
} 