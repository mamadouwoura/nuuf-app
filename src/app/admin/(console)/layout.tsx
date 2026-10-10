import Chargement from "@/components/Chargement";
import { Suspense } from "react";
import AdminShell from "@/components/AdminShell";
import { exigerAdmin } from "@/lib/admin";
import { modeSimulation } from "@/lib/passerelle";
import { getT } from "@/lib/i18n/server";

async function Shell({ children }: { children: React.ReactNode }) {
  const user = await exigerAdmin();
  return (
    <AdminShell nom={user.nomComplet} simulation={modeSimulation()}>
      {children}
    </AdminShell>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getT();
  return (
    <Suspense fallback={<Chargement />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
