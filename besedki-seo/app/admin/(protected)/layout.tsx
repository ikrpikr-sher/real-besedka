import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/adminAuth';
import AdminNav from '@/components/admin/AdminNav';

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAuthed()) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg md:flex-row">
      <AdminNav />
      <main className="flex-1 overflow-x-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}
