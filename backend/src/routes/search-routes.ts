import { FastifyInstance } from 'fastify';
import { searchHandler } from '@controllers/search-controller';

// Search route schema
const SearchQuerySchema = {
    type: 'object',
    properties: {
        query: { type: 'string' },
        type: { type: 'string', enum: ['all', 'products', 'stores'] },
        city: { type: 'string' },
        neighborhood: { type: 'string' },
        state: { type: 'string' },
        minPrice: { type: 'number', minimum: 0 },
        maxPrice: { type: 'number', minimum: 0 },
        categories: {
            type: 'array',
            items: { type: 'string' }
        },
        page: { type: 'number', minimum: 1 },
        limit: { type: 'number', minimum: 1, maximum: 100 }
    }
};

const SearchResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        data: {
            type: 'object',
            properties: {
                products: {
                    type: 'object',
                    properties: {
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    price: { type: 'number' },
                                    available: { type: 'boolean' },
                                    images: {
                                        type: 'array',
                                        items: { type: 'string' }
                                    },
                                    tags: {
                                        type: 'array',
                                        items: { type: 'string' }
                                    },
                                    store_id: { type: 'string' }
                                }
                            }
                        },
                        total: { type: 'number' }
                    }
                },
                stores: {
                    type: 'object',
                    properties: {
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    logo_url: { type: ['string', 'null'] },
                                    banner_url: { type: ['string', 'null'] },
                                    whatsapp: { type: ['string', 'null'] },
                                    categories: {
                                        type: 'array',
                                        items: { type: 'string' }
                                    },
                                    rating: { type: 'number' },
                                    rating_count: { type: 'number' },
                                    city: { type: ['string', 'null'] },
                                    neighborhood: { type: ['string', 'null'] },
                                    state: { type: ['string', 'null'] }
                                }
                            }
                        },
                        total: { type: 'number' }
                    }
                },
                page: { type: 'number' },
                limit: { type: 'number' }
            }
        }
    }
};

// Route definitions
export const searchRoutes = async (fastify: FastifyInstance) => {
    // Integrated search endpoint
    fastify.get('/search', {
        schema: {
            tags: ['Search'],
            description: 'Search for products and stores',
            querystring: SearchQuerySchema,
            response: {
                200: SearchResponseSchema,
                400: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        error: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' }
                            }
                        }
                    }
                }
            }
        },
        handler: searchHandler
    });
}; 