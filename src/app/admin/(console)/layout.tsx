import { Suspense } from "react";
import AdminShell from "@/components/AdminShell";
import { exigerAdmin } from "@/lib/admin";
import { modeSimulation } from "@/lib/passerelle";

async function Shell({ children }: { children: React.ReactNode }) {
  const user = await exigerAdmin();
  return (
    <AdminShell nom={user.nomComplet} simulation={modeSimulation()}>
      {children}
    </AdminShell>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-body-md">Chargement…</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
