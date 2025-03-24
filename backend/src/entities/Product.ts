import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Store } from './Store';
import { OrderItem } from './OrderItem';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ default: true })
    available: boolean;

    @Column({ type: 'text', array: true, default: [] })
    images: string[];

    @Column({ type: 'text', array: true, default: [] })
    tags: string[];

    @ManyToOne(() => Store, (store) => store.products)
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column()
    store_id: string;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
    order_items: OrderItem[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
} 