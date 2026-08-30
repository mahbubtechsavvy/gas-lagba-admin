import { api } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { ProfileForm } from './profile-form';

export const metadata = { title: 'My Profile · Gas Lagba Admin' };

interface UserProfileResponse {
  id: string;
  uniqueCode: string | null;
  kind: 'CUSTOMER' | 'VENDOR_USER' | 'ADMIN';
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl?: string | null;
  locale: string;
  createdAt: string;
}

export default async function ProfilePage() {
  const me = await requireAdmin();

  let userProfile: UserProfileResponse = {
    id: me.id,
    uniqueCode: null,
    kind: 'ADMIN',
    email: me.email,
    fullName: '',
    phone: null,
    locale: 'en',
    createdAt: new Date().toISOString(),
  };

  try {
    userProfile = await api<UserProfileResponse>('/users/me');
  } catch {
    // fallback
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Administrator Profile & Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your personal account profile, contact credentials, and unique account identifier.</p>
      </div>

      <ProfileForm user={userProfile} />
    </div>
  );
}
