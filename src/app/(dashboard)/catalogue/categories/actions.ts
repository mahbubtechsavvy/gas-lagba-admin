'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

function optionalLocalized(en: string, bn: string): { en: string; bn?: string } | undefined {
  if (!en) {
    return undefined;
  }
  return bn ? { en, bn } : { en };
}

export async function createCategory(formData: FormData): Promise<void> {
  const sortOrder = formData.get('sortOrder') as string;
  await api('/admin/categories', {
    method: 'POST',
    body: {
      slug: formData.get('slug') as string,
      nameI18n: { en: formData.get('nameEn') as string, bn: formData.get('nameBn') as string },
      descriptionI18n: optionalLocalized(formData.get('descriptionEn') as string, formData.get('descriptionBn') as string),
      parentId: (formData.get('parentId') as string) || undefined,
      sortOrder: sortOrder ? parseInt(sortOrder, 10) : undefined,
    },
  });
  revalidatePath('/catalogue/categories');
}

export async function updateCategory(categoryId: string, formData: FormData): Promise<void> {
  const sortOrder = formData.get('sortOrder') as string;
  await api(`/admin/categories/${categoryId}`, {
    method: 'PATCH',
    body: {
      nameI18n: { en: formData.get('nameEn') as string, bn: formData.get('nameBn') as string },
      sortOrder: sortOrder ? parseInt(sortOrder, 10) : undefined,
      isActive: formData.get('isActive') === 'on',
    },
  });
  revalidatePath('/catalogue/categories');
}
