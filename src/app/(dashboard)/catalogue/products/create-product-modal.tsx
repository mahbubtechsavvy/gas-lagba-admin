'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createProductAsAdmin } from './actions';

interface CategoryOption {
  id: string;
  name: string;
}

interface VendorOption {
  id: string;
  name: string;
}

export function CreateProductModal({
  categories = [],
  vendors = [],
}: {
  categories?: CategoryOption[];
  vendors?: VendorOption[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [vendorId, setVendorId] = useState(vendors[0]?.id || '');
  const [customVendorId, setCustomVendorId] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [brand, setBrand] = useState('Bashundhara');
  const [unit] = useState<'KG' | 'PIECE' | 'SET'>('KG');
  const [cylinderSizeKg, setCylinderSizeKg] = useState('12');
  const [supplyType, setSupplyType] = useState<'STANDARD' | 'REFILL' | 'NEW_CYLINDER'>('REFILL');
  const [priceTaka, setPriceTaka] = useState('1450');
  const [discountPriceTaka, setDiscountPriceTaka] = useState('');
  const [depositTaka, setDepositTaka] = useState('0');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT' | 'INACTIVE'>('ACTIVE');
  const [approvalStatus, setApprovalStatus] = useState<'APPROVED' | 'PENDING' | 'REJECTED'>('APPROVED');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const targetVendor = vendorId === '__custom' || !vendorId ? customVendorId.trim() : vendorId;
    if (!targetVendor) {
      setError('Please select or specify a Vendor ID');
      return;
    }
    if (!categoryId) {
      setError('Please select a Category');
      return;
    }
    if (!nameEn.trim()) {
      setError('Product name is required');
      return;
    }
    const priceNum = parseFloat(priceTaka);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    startTransition(async () => {
      const res = await createProductAsAdmin({
        vendorId: targetVendor,
        categoryId,
        nameEn: nameEn.trim(),
        nameBn: nameBn.trim() || nameEn.trim(),
        brand: brand.trim() || undefined,
        unit,
        cylinderSizeKg: parseFloat(cylinderSizeKg) || 12,
        supplyType,
        priceTaka: priceNum,
        discountPriceTaka: discountPriceTaka ? parseFloat(discountPriceTaka) : undefined,
        depositTaka: depositTaka ? parseFloat(depositTaka) : 0,
        status,
        approvalStatus,
      });

      if (res.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error || 'Failed to create product');
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#003496] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#002875] transition-colors cursor-pointer"
      >
        <span>+</span> Add Product on Behalf of Vendor
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Create Product on Behalf of Vendor</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Directly register LPG cylinder or accessory to a vendor store with instant approval option.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vendor Selector */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Distributor Vendor *</label>
                  {vendors.length > 0 ? (
                    <select
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none"
                    >
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.id})
                        </option>
                      ))}
                      <option value="__custom">Custom Vendor ID...</option>
                    </select>
                  ) : null}
                  {(vendors.length === 0 || vendorId === '__custom') && (
                    <input
                      type="text"
                      placeholder="Enter Vendor Public ID (e.g. vnd_...)"
                      value={customVendorId}
                      onChange={(e) => setCustomVendorId(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none"
                      required
                    />
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none"
                    required
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <option value="cat_lpg_cylinders">LPG Cylinders</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Product Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name (English) *</label>
                  <input
                    type="text"
                    placeholder="e.g. Bashundhara LP Gas 12kg Refill"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name (Bengali)</label>
                  <input
                    type="text"
                    placeholder="e.g. বসুন্ধরা এলপি গ্যাস ১২ কেজি রিফিল"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none"
                  />
                </div>
              </div>

              {/* Brand & Supply Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none"
                  >
                    <option value="Bashundhara">Bashundhara</option>
                    <option value="Beximco">Beximco</option>
                    <option value="Omera">Omera</option>
                    <option value="Jamuna">Jamuna</option>
                    <option value="BM Gas">BM Gas</option>
                    <option value="TotalGaz">TotalGaz</option>
                    <option value="Laugfs">Laugfs</option>
                    <option value="Universal">Universal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supply Type</label>
                  <select
                    value={supplyType}
                    onChange={(e) => setSupplyType(e.target.value as 'STANDARD' | 'REFILL' | 'NEW_CYLINDER')}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none"
                  >
                    <option value="REFILL">Refill (Exchange Cylinder)</option>
                    <option value="NEW_CYLINDER">New Cylinder with Gas</option>
                    <option value="STANDARD">Standard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cylinder Size (Kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={cylinderSizeKg}
                    onChange={(e) => setCylinderSizeKg(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Retail Price (৳ Taka) *</label>
                  <input
                    type="number"
                    value={priceTaka}
                    onChange={(e) => setPriceTaka(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Price (৳ Optional)</label>
                  <input
                    type="number"
                    placeholder="Leave empty if none"
                    value={discountPriceTaka}
                    onChange={(e) => setDiscountPriceTaka(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deposit (৳ Deposit if New)</label>
                  <input
                    type="number"
                    value={depositTaka}
                    onChange={(e) => setDepositTaka(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none"
                  />
                </div>
              </div>

              {/* Approval & Catalog Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approval Moderation</label>
                  <select
                    value={approvalStatus}
                    onChange={(e) => setApprovalStatus(e.target.value as 'APPROVED' | 'PENDING' | 'REJECTED')}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none"
                  >
                    <option value="APPROVED">✅ APPROVED (Publish immediately)</option>
                    <option value="PENDING">⏳ PENDING (Hold for verification)</option>
                    <option value="REJECTED">❌ REJECTED</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Listing Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'DRAFT' | 'INACTIVE')}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-[#FF6600] px-5 py-2 font-bold text-white shadow-2xs hover:bg-[#EA580C] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isPending ? 'Creating Product...' : 'Create & Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
