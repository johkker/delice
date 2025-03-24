import {
    createReview,
    findReviewById,
    updateReview,
    deleteReview,
    findReviews,
    findUserReviews,
    findStoreReviews,
    flagReview,
    unflagReview,
    updateUserRating,
    updateStoreRating,
    CreateReviewData,
    UpdateReviewData,
    ReviewFilterOptions
} from '@repositories/review-repository';
import { Review, ReviewType } from '@entities/Review';
import { findUserById } from '@repositories/user-repository';
import { findStoreById } from '@repositories/store-repository';
import { UserRole } from '@entities/User';

// Service functions
export const addReview = async (data: CreateReviewData): Promise<Review> => {
    const reviewer = await findUserById(data.reviewer_id);

    if (!reviewer) {
        throw new Error('Reviewer not found');
    }

    if (data.type === ReviewType.USER) {
        if (!data.subject_id) {
            throw new Error('Subject ID is required for user reviews');
        }

        const subject = await findUserById(data.subject_id);

        if (!subject) {
            throw new Error('Subject user not found');
        }

        if (data.reviewer_id === data.subject_id) {
            throw new Error('Cannot review yourself');
        }
    } else if (data.type === ReviewType.STORE) {
        if (!data.store_id) {
            throw new Error('Store ID is required for store reviews');
        }

        const store = await findStoreById(data.store_id);

        if (!store) {
            throw new Error('Store not found');
        }

        if (store.owner_id === data.reviewer_id) {
            throw new Error('Cannot review your own store');
        }
    }

    // Ensure rating is within valid range (0.0 to 5.0)
    if (data.rating < 0 || data.rating > 5) {
        throw new Error('Rating must be between 0 and 5');
    }

    const review = await createReview(data);

    // Update ratings
    if (data.type === ReviewType.USER && data.subject_id) {
        await updateUserRating(data.subject_id);
    } else if (data.type === ReviewType.STORE && data.store_id) {
        await updateStoreRating(data.store_id);
    }

    return review;
};

export const getReviewById = async (id: string): Promise<Review | null> => {
    return findReviewById(id);
};

export const editReview = async (
    id: string,
    data: UpdateReviewData,
    userId: string
): Promise<Review | null> => {
    const review = await findReviewById(id);

    if (!review) {
        throw new Error('Review not found');
    }

    if (review.reviewer_id !== userId) {
        throw new Error('You can only edit your own reviews');
    }

    // Ensure rating is within valid range (0.0 to 5.0)
    if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) {
        throw new Error('Rating must be between 0 and 5');
    }

    const updatedReview = await updateReview(id, data);

    // Update ratings
    if (review.type === ReviewType.USER && review.subject_id) {
        await updateUserRating(review.subject_id);
    } else if (review.type === ReviewType.STORE && review.store_id) {
        await updateStoreRating(review.store_id);
    }

    return updatedReview;
};

export const removeReview = async (
    id: string,
    userId: string,
    isAdmin = false
): Promise<boolean> => {
    const review = await findReviewById(id);

    if (!review) {
        throw new Error('Review not found');
    }

    if (!isAdmin && review.reviewer_id !== userId) {
        throw new Error('You can only delete your own reviews');
    }

    const result = await deleteReview(id);

    // Update ratings
    if (review.type === ReviewType.USER && review.subject_id) {
        await updateUserRating(review.subject_id);
    } else if (review.type === ReviewType.STORE && review.store_id) {
        await updateStoreRating(review.store_id);
    }

    return result;
};

export const getUserReviews = async (userId: string): Promise<Review[]> => {
    const user = await findUserById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    return findUserReviews(userId);
};

export const getStoreReviews = async (storeId: string): Promise<Review[]> => {
    const store = await findStoreById(storeId);

    if (!store) {
        throw new Error('Store not found');
    }

    return findStoreReviews(storeId);
};

export const searchReviews = async (
    filters: ReviewFilterOptions,
    page = 1,
    limit = 10
): Promise<{ reviews: Review[]; total: number; page: number; limit: number }> => {
    const skip = (page - 1) * limit;
    const [reviews, total] = await findReviews(filters, skip, limit);

    return {
        reviews,
        total,
        page,
        limit,
    };
};

export const markReviewAsFlagged = async (
    id: string,
    userId: string
): Promise<Review | null> => {
    const review = await findReviewById(id);

    if (!review) {
        throw new Error('Review not found');
    }

    // Allow users to flag reviews about themselves or their store
    if (
        review.type === ReviewType.USER && review.subject_id !== userId ||
        review.type === ReviewType.STORE && review.store?.owner_id !== userId
    ) {
        throw new Error('You do not have permission to flag this review');
    }

    return flagReview(id);
};

export const adminFlagReview = async (id: string): Promise<Review | null> => {
    const review = await findReviewById(id);

    if (!review) {
        throw new Error('Review not found');
    }

    return flagReview(id);
};

export const adminUnflagReview = async (id: string): Promise<Review | null> => {
    const review = await findReviewById(id);

    if (!review) {
        throw new Error('Review not found');
    }

    return unflagReview(id);
};

export const isUserAdmin = async (userId: string): Promise<boolean> => {
    const user = await findUserById(userId);

    if (!user) {
        return false;
    }

    return user.roles.includes(UserRole.ADMIN);
}; 