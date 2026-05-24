/**
 * Serializes query params for NestJS (repeated keys for arrays, e.g. categoryId=1&categoryId=2).
 */
export function serializeQueryParams(
  params: Record<string, string | number | number[] | undefined | null>,
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, String(item)));
    } else {
      search.append(key, String(value));
    }
  }

  return search.toString();
}
