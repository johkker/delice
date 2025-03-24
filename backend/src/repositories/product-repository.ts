import { AppDataSource } from '@config/data-source';
import { Product } from '@entities/Product';
import { FindOptionsWhere, Like, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

// Repository instance
const productRepository = AppDataSource.getRepository(Product);

// Types
export type CreateProductData = {
    name: string;
    description: string;
    price: number;
    store_id: string;
    available?: boolean;
    images?: string[];
    tags?: string[];
};

export type UpdateProductData = Partial<Omit<CreateProductData, 'store_id'>>;

export type ProductFilterOptions = {
    name?: string;
    store_id?: string;
    available?: boolean;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
};

// Repository functions using a functional approach
export const findProductById = async (id: string): Promise<Product | null> => {
    return productRepository.findOne({
        where: { id },
        relations: ['store', 'store.owner'],
    });
};

export const createProduct = async (data: CreateProductData): Promise<Product> => {
    const product = productRepository.create(data);
    return productRepository.save(product);
};

export const updateProduct = async (id: string, data: UpdateProductData): Promise<Product | null> => {
    const product = await findProductById(id);

    if (!product) {
        return null;
    }

    productRepository.merge(product, data);
    return productRepository.save(product);
};

export const deleteProduct = async (id: string): Promise<boolean> => {
    const result = await productRepository.delete(id);
    return result.affected !== 0;
};

export const findProductsByStoreId = async (storeId: string): Promise<Product[]> => {
    return productRepository.find({
        where: { store_id: storeId },
        order: { created_at: 'DESC' },
    });
};

export const findProducts = async (
    filters: ProductFilterOptions = {},
    skip = 0,
    take = 10
): Promise<[Product[], number]> => {
    const { name, store_id, available, tags, minPrice, maxPrice } = filters;

    // Build the where clause
    const where: FindOptionsWhere<Product> = {};

    if (name) {
        where.name = Like(`%${name}%`);
    }

    if (store_id) {
        where.store_id = store_id;
    }

    if (available !== undefined) {
        where.available = available;
    }

    // Price range filtering
    if (minPrice !== undefined && maxPrice !== undefined) {
        where.price = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
        where.price = MoreThanOrEqual(minPrice);
    } else if (maxPrice !== undefined) {
        where.price = LessThanOrEqual(maxPrice);
    }

    // Tags filtering (this is a simplification, as array search depends on the DB)
    if (tags && tags.length > 0) {
        // For PostgreSQL with array support, we would ideally use array contains
        // This is a placeholder logic
        // In a real implementation, you might use a raw query or a more complex approach
    }

    return productRepository.findAndCount({
        where,
        skip,
        take,
        order: { created_at: 'DESC' },
        relations: ['store'],
    });
}; 