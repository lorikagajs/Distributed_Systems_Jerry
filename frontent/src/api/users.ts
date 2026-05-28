import axiosInstance from './axiosInstance';
import { isMockMode } from '../config/env';
import { mapReview, mapUserProfile } from './mappers';
import {
  mockChangePassword,
  mockDeleteAccount,
  mockGetMyProfile,
  mockGetMyReviews,
  mockUpdateProfile,
} from '../mocks/mockApi';
import type { Review, UserProfile } from '../types';

export async function getMyProfile(): Promise<UserProfile> {
  if (isMockMode()) {
    return mockGetMyProfile();
  }

  const { data } = await axiosInstance.get<Parameters<typeof mapUserProfile>[0]>(
    '/users/profile',
  );
  return mapUserProfile(data);
}

export async function updateProfile(name: string): Promise<UserProfile> {
  if (isMockMode()) {
    return mockUpdateProfile(name);
  }

  const { data } = await axiosInstance.put<Parameters<typeof mapUserProfile>[0]>(
    '/users/profile',
    { name },
  );
  return mapUserProfile(data);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (isMockMode()) {
    return mockChangePassword(currentPassword, newPassword);
  }

  await axiosInstance.put('/users/change-password', {
    currentPassword,
    newPassword,
  });
}

export async function getMyReviews(): Promise<Review[]> {
  if (isMockMode()) {
    return mockGetMyReviews();
  }

  const { data } = await axiosInstance.get<Parameters<typeof mapReview>[0][]>(
    '/users/my-reviews',
  );
  return data.map(mapReview);
}

export async function deleteAccount(): Promise<void> {
  if (isMockMode()) {
    return mockDeleteAccount();
  }

  await axiosInstance.delete('/users/profile');
}
