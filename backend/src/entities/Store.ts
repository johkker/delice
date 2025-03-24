import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Product } from './Product';
import { Review } from './Review';

export enum StoreCategory {
    BAKERY = 'bakery',
    PASTRY = 'pastry',
    CANDY = 'candy',
    SAVORY = 'savory',
    VEGAN = 'vegan',
    HEALTHY = 'healthy',
    OTHER = 'other',
}

@Entity('stores')
export class Store {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'text', nullable: true })
    logo_url: string | null;

    @Column({ type: 'text', nullable: true })
    banner_url: string | null;

    @Column({ type: 'text', nullable: true })
    whatsapp: string | null;

    @Column({
        type: 'enum',
        enum: StoreCategory,
        array: true,
        default: [StoreCategory.OTHER],
    })
    categories: StoreCategory[];

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    rating: number;

    @Column({ default: 0 })
    rating_count: number;

    @Column({ type: 'text', nullable: true })
    address: string | null;

    @Column({ type: 'text', nullable: true })
    city: string | null;

    @Column({ type: 'text', nullable: true })
    neighborhood: string | null;

    @Column({ type: 'text', nullable: true })
    state: string | null;

    @Column({ type: 'text', nullable: true })
    zipcode: string | null;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    latitude: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    longitude: number | null;

    @Column({ type: 'jsonb', nullable: true })
    rules: {
        order_days?: string[];
        delivery_days?: string[];
        min_order_value?: number;
        delivery_fee?: number;
        custom_rules?: string;
    } | null;

    @ManyToOne(() => User, (user) => user.stores)
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @Column()
    owner_id: string;

    @OneToMany(() => Product, (product) => product.store)
    products: Product[];

    @OneToMany(() => Review, (review) => review.store)
    reviews: Review[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
} 