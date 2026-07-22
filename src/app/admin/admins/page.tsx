import { requireAdmin, listAdmins } from "@/lib/admin/auth";
import { AdminManager } from "@/components/admin/admin-manager";

export default async function AdminsPage() {
  // Gate the page itself (not just the layout) so non-admins short-circuit to
  // 404 BEFORE listAdmins runs — the layout and page otherwise render in
  // parallel. requireAdmin is cached, so this is a free re-check.
  const user = await requireAdmin();
  const admins = await listAdmins();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Admins</h1>
      <p className="mt-1 max-w-prose text-sm text-muted">
        People who can sign in and edit site content. Access is granted per
        account and can be revoked at any time.
      </p>

      <AdminManager admins={admins} currentUserId={user.id} />
    </div>
  );
}
