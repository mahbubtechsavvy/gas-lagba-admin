'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addProductImageAsAdmin, removeProductImageAsAdmin } from '../actions';
import { localized, type ProductImageRow } from '../../types';

const PRESET_IMAGES = [
  { label: 'Bashundhara 12kg Red', url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=60' },
  { label: 'Beximco Smart 12kg Composite', url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=60' },
  { label: 'Omera LPG 12kg Blue', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=60' },
  { label: 'Jamuna Gas 12kg Yellow', url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=60' },
  { label: 'Universal Safety Regulator', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60' },
];

export function ProductImagesManager({
  productId,
  images,
  canModerate,
}: {
  productId: string;
  images: ProductImageRow[];
  canModerate: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCustomUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAddImage = (urlToAdd?: string) => {
    const targetUrl = (urlToAdd || customUrl).trim();
    if (!targetUrl) {
      setError('Please provide an image URL, select a file, or pick a brand preset');
      return;
    }
    setError(null);

    startTransition(async () => {
      const res = await addProductImageAsAdmin(productId, targetUrl, altText.trim() || undefined);
      if (res.success) {
        setCustomUrl('');
        setAltText('');
        setShowPresets(false);
        router.refresh();
      } else {
        setError(res.error || 'Failed to add image');
      }
    });
  };

  const handleRemoveImage = (imageId: string) => {
    if (!confirm('Are you sure you want to remove this photo?')) return;
    setError(null);

    startTransition(async () => {
      const res = await removeProductImageAsAdmin(productId, imageId);
      if (res.success) {
        router.refresh();
      } else {
        setError(res.error || 'Failed to remove image');
      }
    });
  };

  return (
    <div className="space-y-4">
      {error ? <div className="rounded bg-rose-50 p-2.5 text-xs text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">{error}</div> : null}

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-200 p-6 text-center dark:border-zinc-800">
          <p className="text-xs text-zinc-500">No product photos uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={localized(img.altI18n) || 'Product photo'}
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="p-2">
                <p className="truncate font-mono text-[10px] text-zinc-500">{img.storageKey}</p>
                {canModerate ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleRemoveImage(img.id)}
                    className="mt-1 text-[11px] font-medium text-rose-600 hover:underline dark:text-rose-400 disabled:opacity-50"
                  >
                    Delete photo
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {canModerate ? (
        <div className="mt-4 rounded-lg border border-zinc-100 bg-zinc-50/70 p-3.5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Upload or Add Product Photo</h3>
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              {showPresets ? 'Hide presets' : '✨ Select Brand Preset'}
            </button>
          </div>

          {showPresets ? (
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleAddImage(preset.url)}
                  className="flex items-center gap-2 rounded border border-zinc-200 bg-white p-2 text-left text-xs hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preset.url} alt={preset.label} className="h-8 w-8 rounded object-cover" />
                  <span className="truncate font-medium">{preset.label}</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center justify-center rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              📁 Browse Device Photo
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <input
              type="text"
              placeholder="Or paste image URL or storage key..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
            />

            <button
              type="button"
              disabled={isPending || !customUrl.trim()}
              onClick={() => handleAddImage()}
              className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Add Photo'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
