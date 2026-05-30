import axiosInstance from './axiosInstance';
import { isMockMode } from '../config/env';

export interface ProductDescriptionResponse {
  description: string;
}

export interface ChatResponse {
  response: string;
}

/**
 * Generate an e-commerce product description from a name + category using the
 * backend AI module (POST /ai/product-description). Requires an authenticated
 * admin token (attached automatically by the axios interceptor).
 */
export async function generateProductDescription(
  name: string,
  category: string,
): Promise<string> {
  if (isMockMode()) {
    return (
      `Meet the ${name} — a standout in our ${category} lineup. ` +
      'Crafted with quality materials and thoughtful details, it blends everyday ' +
      'practicality with a premium feel. A reliable choice you will reach for again and again.'
    );
  }

  const { data } = await axiosInstance.post<ProductDescriptionResponse>(
    '/ai/product-description',
    { name, category },
  );
  return data.description;
}

/** Single-turn chat with the store assistant (POST /ai/chat). */
export async function chatWithAssistant(message: string): Promise<string> {
  if (isMockMode()) {
    return 'This is a demo response. Connect to the API to chat with the assistant.';
  }

  const { data } = await axiosInstance.post<ChatResponse>('/ai/chat', {
    message,
  });
  return data.response;
}
