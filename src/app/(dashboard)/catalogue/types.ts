/** Shapes returned by the API catalogue endpoints (`gas-lagba-api` docs/02-backend/API.md). */

export interface CategoryRow {
  id: string;
  slug: string;
  parentId: string | null;
  nameI18n: Record<string, string>;
  descriptionI18n: Record<string, string> | null;
  imageKey: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantRow {
  id: string;
  sku: string | null;
  nameI18n: Record<string, string>;
  cylinderSizeKg: number | null;
  supplyType: 'STANDARD' | 'REFILL' | 'NEW_CYLINDER';
  pricePaisa: number;
  discountPricePaisa: number | null;
  effectivePricePaisa: number;
  depositPaisa: number;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductImageRow {
  id: string;
  storageKey: string;
  url: string;
  altI18n: Record<string, string> | null;
  sortOrder: number;
}

export interface ProductRow {
  id: string;
  vendorId: string;
  vendorName?: string;
  categoryId: string;
  nameI18n: Record<string, string>;
  descriptionI18n: Record<string, string> | null;
  brand: string | null;
  unit: 'KG' | 'PIECE' | 'SET';
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvalNote: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariantRow[];
  images: ProductImageRow[];
}

/** Money is integer paisa on the wire (BR-300); the admin formats it for display only. */
export function formatPaisa(paisa: number): string {
  const taka = Math.trunc(Math.abs(paisa) / 100);
  const fraction = Math.abs(paisa) % 100;
  return `${paisa < 0 ? '-' : ''}৳${taka.toLocaleString('en-US')}.${fraction.toString().padStart(2, '0')}`;
}

export function localized(text: Record<string, string> | null | undefined): string {
  return text?.en || text?.bn || '—';
}

export const APPROVAL_BADGE: Record<ProductRow['approvalStatus'], string> = {
  APPROVED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  REJECTED: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
};
