import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const admin = await isAdmin();
  if (!admin) {
    redirect("/?error=admin_required");
  }

  return (
    <div className="min-h-screen bg-bg flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto animate-[in-fade-up_0.3s_ease-out]">
        {children}
      </main>
    </div>
  );
}
