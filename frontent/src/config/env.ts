/** When true, API modules use local mock data instead of the Nest backend. */
export function isMockMode(): boolean {
  return import.meta.env.VITE_USE_MOCK_DATA !== 'false';
}
