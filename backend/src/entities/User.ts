import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Store } from './Store';
import { Review } from './Review';
import { Order } from './Order';
import { isValidDocument, formatDocument } from '@utils/document-validator';

export enum UserRole {
    CUSTOMER = 'customer',
    PRODUCER = 'producer',
    ADMIN = 'admin',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'text', nullable: true })
    avatar_url: string | null;

    @Column({ type: 'text', unique: true })
    phone: string;

    @Column({ type: 'text', unique: true })
    document: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        array: true,
        default: [UserRole.CUSTOMER],
    })
    roles: UserRole[];

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    rating: number;

    @Column({ default: 0 })
    rating_count: number;

    @OneToMany(() => Store, (store) => store.owner)
    stores: Store[];

    @OneToMany(() => Review, (review) => review.reviewer)
    reviews_given: Review[];

    @OneToMany(() => Review, (review) => review.subject)
    reviews_received: Review[];

    @OneToMany(() => Order, (order) => order.customer)
    orders: Order[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Static method to validate and format document
    static validateAndFormatDocument(document: string | null): string | null {
        if (!document) {
            return null;
        }

        // Validate document
        if (!isValidDocument(document)) {
            throw new Error('Documento inválido. Informe um CPF ou CNPJ válido.');
        }

        // Format document
        return formatDocument(document);
    }
} 