import { AppDataSource } from '@config/data-source';
import { Store, StoreCategory } from '@entities/Store';
import { FindOptionsWhere, Like, In, MoreThanOrEqual } from 'typeorm';

// Repository instance
const storeRepository = AppDataSource.getRepository(Store);

// Types
export type CreateStoreData = {
    name: string;
    description: string;
    owner_id: string;
    logo_url?: string;
    banner_url?: string;
    whatsapp?: string;
    categories?: StoreCategory[];
    address?: string;
    city?: string;
    neighborhood?: string;
    state?: string;
    zipcode?: string;
    latitude?: number;
    longitude?: number;
    rules?: {
        order_days?: string[];
        delivery_days?: string[];
        min_order_value?: number;
        delivery_fee?: number;
        custom_rules?: string;
    };
};

export type UpdateStoreData = Partial<Omit<CreateStoreData, 'owner_id'>>;

export type StoreFilterOptions = {
    name?: string;
    city?: string;
    neighborhood?: string;
    state?: string;
    categories?: StoreCategory[];
    maxDistance?: number;
    userLatitude?: number;
    userLongitude?: number;
    minRating?: number;
    priceRange?: { min?: number; max?: number };
};

// Repository functions using a functional approach
export const findStoreById = async (id: string): Promise<Store | null> => {
    return storeRepository.findOne({
        where: { id },
        relations: ['owner'],
    });
};

export const createStore = async (data: CreateStoreData): Promise<Store> => {
    const store = storeRepository.create({
        ...data,
        categories: data.categories || [StoreCategory.OTHER],
    });

    return storeRepository.save(store);
};

export const updateStore = async (id: string, data: UpdateStoreData): Promise<Store | null> => {
    const store = await findStoreById(id);

    if (!store) {
        return null;
    }

    storeRepository.merge(store, data);
    return storeRepository.save(store);
};

export const deleteStore = async (id: string): Promise<boolean> => {
    const result = await storeRepository.delete(id);
    return result.affected !== 0;
};

export const findStoresByOwnerId = async (ownerId: string): Promise<Store[]> => {
    return storeRepository.find({
        where: { owner_id: ownerId },
    });
};

export const findStores = async (
    filters: StoreFilterOptions = {},
    skip = 0,
    take = 10
): Promise<[Store[], number]> => {
    const {
        name,
        city,
        neighborhood,
        state,
        categories,
        minRating,
        priceRange,
        // Distance filters are handled separately
    } = filters;

    // Build the where clause
    const where: FindOptionsWhere<Store> = {};

    if (name) {
        where.name = Like(`%${name}%`);
    }

    if (city) {
        where.city = Like(`%${city}%`);
    }

    if (neighborhood) {
        where.neighborhood = Like(`%${neighborhood}%`);
    }

    if (state) {
        where.state = Like(`%${state}%`);
    }

    if (categories && categories.length > 0) {
        // This requires array overlap which is complex in TypeORM
        // Using a relation query with Join would be better here
        // For simplicity, will implement it as an example
        where.categories = In(categories);
    }

    if (minRating !== undefined) {
        where.rating = MoreThanOrEqual(minRating);
    }

    if (priceRange) {
        // This would need to be implemented by joining with products
        // and finding stores with products in the price range
        // For simplicity, this is omitted here
    }

    // Geographic distance filtering would be implemented using
    // PostGIS or a similar calculation in a more advanced query

    return storeRepository.findAndCount({
        where,
        skip,
        take,
        relations: ['owner'],
    });
};

export const addCategoryToStore = async (id: string, category: StoreCategory): Promise<Store | null> => {
    const store = await findStoreById(id);

    if (!store) {
        return null;
    }

    if (!store.categories.includes(category)) {
        store.categories.push(category);
        return storeRepository.save(store);
    }

    return store;
};

export const removeCategoryFromStore = async (id: string, category: StoreCategory): Promise<Store | null> => {
    const store = await findStoreById(id);

    if (!store) {
        return null;
    }

    if (store.categories.includes(category)) {
        store.categories = store.categories.filter(c => c !== category);
        return storeRepository.save(store);
    }

    return store;
}; 