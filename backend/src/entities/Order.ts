import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Store } from './Store';
import { OrderItem } from './OrderItem';

export enum OrderStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    PREPARING = 'preparing',
    READY = 'ready',
    DELIVERED = 'delivered',
    CANCELED = 'canceled',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    delivery_fee: number;

    @Column({ type: 'text', nullable: true })
    delivery_address: string | null;

    @Column({ type: 'timestamp', nullable: true })
    delivery_date: Date | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({ name: 'customer_id' })
    customer: User;

    @Column()
    customer_id: string;

    @ManyToOne(() => Store)
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column()
    store_id: string;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
    items: OrderItem[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
} 