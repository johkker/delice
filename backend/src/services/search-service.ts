import { findProducts, ProductFilterOptions } from '@repositories/product-repository';
import { findStores, StoreFilterOptions } from '@repositories/store-repository';
import { Product } from '@entities/Product';
import { Store } from '@entities/Store';

export type IntegratedSearchOptions = {
    query?: string;
    type?: 'all' | 'products' | 'stores';
    city?: string;
    neighborhood?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    categories?: string[];
    page?: number;
    limit?: number;
};

export type IntegratedSearchResult = {
    products?: {
        items: Product[];
        total: number;
    };
    stores?: {
        items: Store[];
        total: number;
    };
    page: number;
    limit: number;
};

export const searchProducts = async (
    options: IntegratedSearchOptions
): Promise<{ items: Product[]; total: number }> => {
    const filters: ProductFilterOptions = {
        name: options.query,
        minPrice: options.minPrice,
        maxPrice: options.maxPrice,
        tags: options.categories,
    };

    const [products, total] = await findProducts(
        filters,
        ((options.page || 1) - 1) * (options.limit || 10),
        options.limit || 10
    );

    return {
        items: products,
        total,
    };
};

export const searchStores = async (
    options: IntegratedSearchOptions
): Promise<{ items: Store[]; total: number }> => {
    const filters: StoreFilterOptions = {
        name: options.query,
        city: options.city,
        neighborhood: options.neighborhood,
        state: options.state,
        categories: options.categories as any[],
    };

    const [stores, total] = await findStores(
        filters,
        ((options.page || 1) - 1) * (options.limit || 10),
        options.limit || 10
    );

    return {
        items: stores,
        total,
    };
};

export const integratedSearch = async (
    options: IntegratedSearchOptions
): Promise<IntegratedSearchResult> => {
    const searchType = options.type || 'all';
    const page = options.page || 1;
    const limit = options.limit || 10;

    const results: IntegratedSearchResult = {
        page,
        limit,
    };

    if (searchType === 'all' || searchType === 'products') {
        results.products = await searchProducts(options);
    }

    if (searchType === 'all' || searchType === 'stores') {
        results.stores = await searchStores(options);
    }

    return results;
}; 