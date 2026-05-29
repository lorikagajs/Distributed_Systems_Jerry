/** Tenant-isolated Cloudinary folder: tenant_{id}/products/product_{id}/ */
export function productImageFolder(tenantId: number, productId: number): string {
  return `tenant_${tenantId}/products/product_${productId}`;
}
