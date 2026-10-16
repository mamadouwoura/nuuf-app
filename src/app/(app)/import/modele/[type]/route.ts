import { celluleCsv } from "@/lib/csv";
import { MODELE_BIENS, MODELE_PROPRIETAIRES } from "@/lib/import";
import { getUser } from "@/lib/session";

/** Modèle de fichier à remplir (CSV, séparateur « ; », UTF-8 avec BOM : s'ouvre directement dans Excel). */
export async function GET(_: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const user = await getUser();
  if (!user) return new Response("Non autorisé", { status: 401 });
  const modele = type === "biens" ? MODELE_BIENS : type === "proprietaires" ? MODELE_PROPRIETAIRES : null;
  if (!modele) return new Response("Introuvable", { status: 404 });
  const corps = [modele.entetes, modele.exemple].map((l) => l.map(celluleCsv).join(";")).join("\r\n");
  return new Response(`﻿${corps}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="modele-${type}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
