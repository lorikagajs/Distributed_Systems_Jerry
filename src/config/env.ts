/** When true, API modules use local mock data instead of the Nest backend. */
export function isMockMode(): boolean {
  return import.meta.env.VITE_USE_MOCK_DATA === 'true';
}

/** Base URL for the NestJS API. */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
}
