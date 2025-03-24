import {
    createProduct,
    findProductById,
    updateProduct,
    deleteProduct,
    findProductsByStoreId,
    findProducts,
    ProductFilterOptions,
    CreateProductData,
    UpdateProductData
} from '@repositories/product-repository';
import { Product } from '@entities/Product';
import { findStoreById } from '@repositories/store-repository';

// Service functions
export const createNewProduct = async (data: CreateProductData): Promise<Product> => {
    const store = await findStoreById(data.store_id);

    if (!store) {
        throw new Error('Store not found');
    }

    return createProduct(data);
};

export const getProductById = async (id: string): Promise<Product | null> => {
    return findProductById(id);
};

export const updateProductById = async (
    id: string,
    data: UpdateProductData,
    userId: string
): Promise<Product | null> => {
    const product = await findProductById(id);

    if (!product) {
        throw new Error('Product not found');
    }

    if (product.store.owner_id !== userId) {
        throw new Error('You do not have permission to update this product');
    }

    return updateProduct(id, data);
};

export const removeProduct = async (id: string, userId: string): Promise<boolean> => {
    const product = await findProductById(id);

    if (!product) {
        throw new Error('Product not found');
    }

    if (product.store.owner_id !== userId) {
        throw new Error('You do not have permission to delete this product');
    }

    return deleteProduct(id);
};

export const getStoreProducts = async (storeId: string): Promise<Product[]> => {
    const store = await findStoreById(storeId);

    if (!store) {
        throw new Error('Store not found');
    }

    return findProductsByStoreId(storeId);
};

export const searchProducts = async (
    filters: ProductFilterOptions,
    page = 1,
    limit = 10
): Promise<{ products: Product[]; total: number; page: number; limit: number }> => {
    const skip = (page - 1) * limit;
    const [products, total] = await findProducts(filters, skip, limit);

    return {
        products,
        total,
        page,
        limit,
    };
};

export const toggleProductAvailability = async (
    id: string,
    userId: string
): Promise<Product | null> => {
    const product = await findProductById(id);

    if (!product) {
        throw new Error('Product not found');
    }

    if (product.store.owner_id !== userId) {
        throw new Error('You do not have permission to update this product');
    }

    return updateProduct(id, { available: !product.available });
}; 