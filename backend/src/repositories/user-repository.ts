import { AppDataSource } from '@config/data-source';
import { User, UserRole } from '@entities/User';
import { FindOptionsWhere } from 'typeorm';

// Repository instance
const userRepository = AppDataSource.getRepository(User);

// Types
export type CreateUserData = {
    name: string;
    email: string;
    password: string;
    avatar_url?: string;
    phone: string;
    document: string;
    roles?: UserRole[];
    email_verified?: boolean;
    phone_verified?: boolean;
};

export type UpdateUserData = Partial<Omit<CreateUserData, 'password' | 'email' | 'document' | 'phone'>>;

export type UpdateUserProfileData = {
    name?: string;
    avatar_url?: string | null;
};

export type UpdateUserEmailData = {
    email: string;
};

export type UpdateUserPhoneData = {
    phone: string;
};

export type UpdateUserPasswordData = {
    password: string;
};

// Repository functions using a functional approach
export const findUserById = async (id: string): Promise<User | null> => {
    return userRepository.findOneBy({ id });
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
    return userRepository.findOneBy({ email });
};

export const findUserByDocument = async (document: string): Promise<User | null> => {
    return userRepository.findOneBy({ document });
};

export const findUserByPhone = async (phone: string): Promise<User | null> => {
    return userRepository.findOneBy({ phone });
};

export const createUser = async (data: CreateUserData): Promise<User> => {
    const user = userRepository.create({
        ...data,
        roles: data.roles || [UserRole.CUSTOMER],
    });

    return userRepository.save(user);
};

export const updateUser = async (id: string, data: UpdateUserData): Promise<User | null> => {
    const user = await findUserById(id);

    if (!user) {
        return null;
    }

    userRepository.merge(user, data);
    return userRepository.save(user);
};

export const deleteUser = async (id: string): Promise<boolean> => {
    const result = await userRepository.delete(id);
    return result.affected !== 0;
};

export const findUsers = async (where: FindOptionsWhere<User> = {}, skip = 0, take = 10): Promise<[User[], number]> => {
    return userRepository.findAndCount({
        where,
        skip,
        take,
    });
};

export const addRoleToUser = async (id: string, role: UserRole): Promise<User | null> => {
    const user = await findUserById(id);

    if (!user) {
        return null;
    }

    if (!user.roles.includes(role)) {
        user.roles.push(role);
        return userRepository.save(user);
    }

    return user;
};

export const removeRoleFromUser = async (id: string, role: UserRole): Promise<User | null> => {
    const user = await findUserById(id);

    if (!user) {
        return null;
    }

    if (user.roles.includes(role)) {
        user.roles = user.roles.filter(r => r !== role);
        return userRepository.save(user);
    }

    return user;
};

export const updateUserProfile = async (id: string, data: UpdateUserProfileData): Promise<User | null> => {
    const user = await findUserById(id);

    if (!user) {
        return null;
    }

    userRepository.merge(user, data);
    return userRepository.save(user);
};

export const updateUserEmail = async (id: string, data: UpdateUserEmailData): Promise<User | null> => {
    const user = await findUserById(id);

    if (!user) {
        return null;
    }

    // Check if the email is already in use by another user
    const existingUser = await findUserByEmail(data.email);
    if (existingUser && existingUser.id !== id) {
        throw new Error('Este email já está em uso por outro usuário');
    }

    userRepository.merge(user, data);
    return userRepository.save(user);
};

export const updateUserPhone = async (id: string, data: UpdateUserPhoneData): Promise<User | null> => {
    const user = await findUserById(id);

    if (!user) {
        return null;
    }

    // Check if the phone is already in use by another user
    const existingUser = await findUserByPhone(data.phone);
    if (existingUser && existingUser.id !== id) {
        throw new Error('Este telefone já está em uso por outro usuário');
    }

    userRepository.merge(user, data);
    return userRepository.save(user);
};

export const updateUserPassword = async (id: string, data: UpdateUserPasswordData): Promise<User | null> => {
    const user = await findUserById(id);

    if (!user) {
        return null;
    }

    userRepository.merge(user, data);
    return userRepository.save(user);
}; 