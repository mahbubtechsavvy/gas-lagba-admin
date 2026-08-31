'use client';

import { useState, useTransition, useRef } from 'react';
import { updateAdminProfile } from './actions';

interface ProfileFormProps {
  user: {
    id: string;
    uniqueCode: string | null;
    email: string;
    fullName: string;
    phone: string | null;
    avatarUrl?: string | null;
    locale: string;
    kind: string;
    roles?: string[];
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (user.uniqueCode) {
      navigator.clipboard.writeText(user.uniqueCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form
      action={(formData) => {
        setError(null);
        setSuccess(false);
        if (avatarPreview) {
          formData.set('avatarKey', avatarPreview);
        }
        startTransition(async () => {
          try {
            await updateAdminProfile(formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 4000);
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
          }
        });
      }}
      className="space-y-6"
    >
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
          ✓ Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
          ✕ {error}
        </div>
      )}

      {/* ID Card Display */}
      <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50/70 to-amber-50/40 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar preview */}
            <div className="relative group">
              <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-orange-500 bg-white flex items-center justify-center text-xl font-bold text-orange-600 shadow-sm">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span>{user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-slate-900/50 backdrop-blur-[1px] text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                Change
              </button>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">Your Unique Account ID</p>
              <div className="mt-1 flex items-center gap-3">
                <span className="font-mono text-2xl font-black tracking-tight text-slate-900">
                  #{user.uniqueCode || '—'}
                </span>
                {user.uniqueCode && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-lg bg-orange-600 px-2.5 py-1 text-xs font-bold text-white shadow-2xs hover:bg-orange-700 transition-colors"
                  >
                    {copied ? '✓ Copied!' : '📋 Copy ID'}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white font-mono">
              {user.kind}
            </span>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-600">
          Use this 8-digit unique ID for account verification, support lookup, and quick identification across Gas Lagba services.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Edit Personal Information & Photo</h2>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold text-[#FF6600] hover:underline"
          >
            📷 Upload New Photo
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div>
            <label className="font-bold text-slate-700">Full Name</label>
            <input
              type="text"
              name="fullName"
              defaultValue={user.fullName}
              placeholder="e.g. Mahbub Rahman"
              required
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700">Email Address (Read-only)</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700">Phone Number</label>
            <input
              type="text"
              name="phone"
              defaultValue={user.phone || ''}
              placeholder="e.g. 01812345678 or +8801812345678"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Bangladeshi mobile number format (+8801XXXXXXXXX)</span>
          </div>

          <div>
            <label className="font-bold text-slate-700">Preferred Language</label>
            <select
              name="locale"
              defaultValue={user.locale || 'en'}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium text-slate-800 focus:border-[#FF6600] focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20"
            >
              <option value="en">English (EN)</option>
              <option value="bn">বাংলা (Bengali)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-[#FF6600] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#EA580C] disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving Profile...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
