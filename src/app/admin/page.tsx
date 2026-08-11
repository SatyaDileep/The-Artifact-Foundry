import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { isDemoMode, DEMO_ADMIN_EMAIL } from "@/lib/demo-data";
import { isAdminAllowed } from "@/lib/utils";

export const metadata = {
  title: "Curator Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (isDemoMode) {
    return <AdminDashboard userEmail={DEMO_ADMIN_EMAIL} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin?next=/admin");
  if (!isAdminAllowed(user.email)) redirect("/");

  return <AdminDashboard userEmail={user.email ?? ""} />;
}
