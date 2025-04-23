import api from './api';

export type SearchType = 'all' | 'products' | 'stores';

export interface SearchFilters {
    query?: string;
    type?: SearchType;
    city?: string;
    neighborhood?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    categories?: string[];
    page?: number;
    limit?: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    available: boolean;
    images: string[];
    tags: string[];
    store_id: string;
}

export interface Store {
    id: string;
    name: string;
    description: string;
    logo_url: string | null;
    banner_url: string | null;
    whatsapp: string | null;
    categories: string[];
    rating: number;
    rating_count: number;
    city: string | null;
    neighborhood: string | null;
    state: string | null;
}

export interface SearchResponse {
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
}

export const search = async (filters: SearchFilters): Promise<SearchResponse> => {
    const params = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
                value.forEach((item) => params.append(`${key}[]`, item));
            } else {
                params.append(key, value.toString());
            }
        }
    });

    const { data } = await api.get<{ success: boolean; data: SearchResponse }>(`/search?${params.toString()}`);
    return data.data;
}; 