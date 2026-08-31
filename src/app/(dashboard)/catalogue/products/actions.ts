'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

export async function createProductAsAdmin(data: {
  vendorId: string;
  categoryId: string;
  nameEn: string;
  nameBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  brand?: string;
  photoUrl?: string;
  unit?: 'KG' | 'PIECE' | 'SET';
  cylinderSizeKg?: number;
  supplyType?: 'STANDARD' | 'REFILL' | 'NEW_CYLINDER';
  priceTaka: number;
  discountPriceTaka?: number;
  depositTaka?: number;
  status?: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
  approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
}): Promise<{ success: boolean; error?: string }> {
  try {
    const pricePaisa = Math.round(data.priceTaka * 100);
    const discountPricePaisa = data.discountPriceTaka ? Math.round(data.discountPriceTaka * 100) : undefined;
    const depositPaisa = data.depositTaka ? Math.round(data.depositTaka * 100) : 0;

    await api('/admin/products', {
      method: 'POST',
      body: {
        vendorId: data.vendorId,
        categoryId: data.categoryId,
        nameI18n: {
          en: data.nameEn.trim(),
          bn: data.nameBn.trim() || data.nameEn.trim(),
        },
        descriptionI18n:
          data.descriptionEn || data.descriptionBn
            ? {
                en: data.descriptionEn?.trim() || data.nameEn.trim(),
                bn: data.descriptionBn?.trim() || data.nameBn.trim() || data.nameEn.trim(),
              }
            : undefined,
        brand: data.brand?.trim() || undefined,
        photoUrl: data.photoUrl?.trim() || undefined,
        unit: data.unit || 'KG',
        status: data.status || 'ACTIVE',
        approvalStatus: data.approvalStatus || 'APPROVED',
        variants: [
          {
            nameI18n: {
              en: `${data.cylinderSizeKg || 12} kg ${data.supplyType || 'STANDARD'}`,
              bn: `${data.cylinderSizeKg || 12} কেজি`,
            },
            cylinderSizeKg: data.cylinderSizeKg || 12,
            supplyType: data.supplyType || 'STANDARD',
            pricePaisa,
            discountPricePaisa,
            depositPaisa,
            sortOrder: 0,
          },
        ],
      },
    });

    revalidatePath('/catalogue/products');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create product' };
  }
}

export async function addProductImageAsAdmin(
  productId: string,
  storageKey: string,
  altText?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await api(`/admin/products/${productId}/images`, {
      method: 'POST',
      body: {
        storageKey: storageKey.trim(),
        altI18n: altText ? { en: altText, bn: altText } : undefined,
      },
    });
    revalidatePath(`/catalogue/products/${productId}`);
    revalidatePath('/catalogue/products');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to add image' };
  }
}

export async function removeProductImageAsAdmin(
  productId: string,
  imageId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await api(`/admin/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    });
    revalidatePath(`/catalogue/products/${productId}`);
    revalidatePath('/catalogue/products');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to remove image' };
  }
}

export async function deleteProductAsAdmin(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await api(`/admin/products/${productId}`, { method: 'DELETE' });
    revalidatePath('/catalogue/products');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete product' };
  }
}
