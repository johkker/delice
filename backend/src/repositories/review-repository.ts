import { AppDataSource } from '@config/data-source';
import { Review, ReviewType } from '@entities/Review';
import { User } from '@entities/User';
import { Store } from '@entities/Store';
import { FindOptionsWhere, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';

// Repository instance
const reviewRepository = AppDataSource.getRepository(Review);

// Types
export type CreateReviewData = {
    type: ReviewType;
    rating: number;
    comment?: string;
    reviewer_id: string;
    subject_id?: string;
    store_id?: string;
};

export type UpdateReviewData = Pick<CreateReviewData, 'rating' | 'comment'>;

export type ReviewFilterOptions = {
    type?: ReviewType;
    reviewer_id?: string;
    subject_id?: string;
    store_id?: string;
    minRating?: number;
    maxRating?: number;
    is_flagged?: boolean;
};

// Repository functions using a functional approach
export const findReviewById = async (id: string): Promise<Review | null> => {
    return reviewRepository.findOne({
        where: { id },
        relations: ['reviewer', 'subject', 'store'],
    });
};

export const createReview = async (data: CreateReviewData): Promise<Review> => {
    const review = reviewRepository.create(data);
    return reviewRepository.save(review);
};

export const updateReview = async (id: string, data: UpdateReviewData): Promise<Review | null> => {
    const review = await findReviewById(id);

    if (!review) {
        return null;
    }

    reviewRepository.merge(review, data);
    return reviewRepository.save(review);
};

export const deleteReview = async (id: string): Promise<boolean> => {
    const result = await reviewRepository.delete(id);
    return result.affected !== 0;
};

export const findReviews = async (
    filters: ReviewFilterOptions = {},
    skip = 0,
    take = 10
): Promise<[Review[], number]> => {
    const { type, reviewer_id, subject_id, store_id, minRating, maxRating, is_flagged } = filters;

    // Build the where clause
    const where: FindOptionsWhere<Review> = {};

    if (type) {
        where.type = type;
    }

    if (reviewer_id) {
        where.reviewer_id = reviewer_id;
    }

    if (subject_id) {
        where.subject_id = subject_id;
    }

    if (store_id) {
        where.store_id = store_id;
    }

    if (is_flagged !== undefined) {
        where.is_flagged = is_flagged;
    }

    // Rating range filtering
    if (minRating !== undefined && maxRating !== undefined) {
        where.rating = Between(minRating, maxRating);
    } else if (minRating !== undefined) {
        where.rating = MoreThanOrEqual(minRating);
    } else if (maxRating !== undefined) {
        where.rating = LessThanOrEqual(maxRating);
    }

    return reviewRepository.findAndCount({
        where,
        skip,
        take,
        order: { created_at: 'DESC' },
        relations: ['reviewer', 'subject', 'store'],
    });
};

export const findUserReviews = async (userId: string): Promise<Review[]> => {
    return reviewRepository.find({
        where: { subject_id: userId },
        order: { created_at: 'DESC' },
        relations: ['reviewer'],
    });
};

export const findStoreReviews = async (storeId: string): Promise<Review[]> => {
    return reviewRepository.find({
        where: { store_id: storeId },
        order: { created_at: 'DESC' },
        relations: ['reviewer'],
    });
};

export const flagReview = async (id: string): Promise<Review | null> => {
    const review = await findReviewById(id);

    if (!review) {
        return null;
    }

    review.is_flagged = true;
    return reviewRepository.save(review);
};

export const unflagReview = async (id: string): Promise<Review | null> => {
    const review = await findReviewById(id);

    if (!review) {
        return null;
    }

    review.is_flagged = false;
    return reviewRepository.save(review);
};

// Helper function to update user rating
export const updateUserRating = async (userId: string): Promise<void> => {
    const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });

    if (!user) {
        return;
    }

    const reviews = await reviewRepository.find({
        where: { subject_id: userId },
    });

    if (reviews.length === 0) {
        user.rating = 0;
        user.rating_count = 0;
    } else {
        const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating), 0);
        user.rating = totalRating / reviews.length;
        user.rating_count = reviews.length;
    }

    await AppDataSource.getRepository(User).save(user);
};

// Helper function to update store rating
export const updateStoreRating = async (storeId: string): Promise<void> => {
    const store = await AppDataSource.getRepository(Store).findOneBy({ id: storeId });

    if (!store) {
        return;
    }

    const reviews = await reviewRepository.find({
        where: { store_id: storeId },
    });

    if (reviews.length === 0) {
        store.rating = 0;
        store.rating_count = 0;
    } else {
        const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating), 0);
        store.rating = totalRating / reviews.length;
        store.rating_count = reviews.length;
    }

    await AppDataSource.getRepository(Store).save(store);
}; 