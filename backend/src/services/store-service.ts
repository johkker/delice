import {
    createStore,
    findStoreById,
    updateStore,
    deleteStore,
    findStores,
    findStoresByOwnerId,
    StoreFilterOptions
} from '@repositories/store-repository';
import { Store, StoreCategory } from '@entities/Store';
import { findUserById } from '@repositories/user-repository';
import { UserRole } from '@entities/User';

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

// Service functions
export const createNewStore = async (data: CreateStoreData): Promise<Store> => {
    const user = await findUserById(data.owner_id);

    if (!user) {
        throw new Error('User not found');
    }

    if (!user.roles.includes(UserRole.PRODUCER)) {
        throw new Error('User does not have producer role');
    }

    return createStore(data);
};

export const getStoreById = async (id: string): Promise<Store | null> => {
    return findStoreById(id);
};

export const updateStoreById = async (
    id: string,
    data: UpdateStoreData,
    userId: string
): Promise<Store | null> => {
    const store = await findStoreById(id);

    if (!store) {
        throw new Error('Store not found');
    }

    if (store.owner_id !== userId) {
        throw new Error('You do not have permission to update this store');
    }

    return updateStore(id, data);
};

export const removeStore = async (id: string, userId: string): Promise<boolean> => {
    const store = await findStoreById(id);

    if (!store) {
        throw new Error('Store not found');
    }

    if (store.owner_id !== userId) {
        throw new Error('You do not have permission to delete this store');
    }

    return deleteStore(id);
};

export const getUserStores = async (userId: string): Promise<Store[]> => {
    return findStoresByOwnerId(userId);
};

export const searchStores = async (
    filters: StoreFilterOptions,
    page = 1,
    limit = 10
): Promise<{ stores: Store[]; total: number; page: number; limit: number }> => {
    const skip = (page - 1) * limit;
    const [stores, total] = await findStores(filters, skip, limit);

    return {
        stores,
        total,
        page,
        limit,
    };
};

// Helper function to calculate distance between two coordinates
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    // Using the Haversine formula to calculate distance between two points
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    return distance;
}; 