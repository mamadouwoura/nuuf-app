import Link from "next/link";

export const TAILLE_PAGE = 24;

/** Numéro de page demandé (toujours un entier ≥ 1, jamais une valeur absurde). */
export const numeroPage = (v: string | undefined) => Math.min(10_000, Math.max(1, Math.floor(Number(v)) || 1));

/** Découpe une liste en mémoire pour la page demandée. */
export const decouper = <T,>(liste: T[], page: number, taille = TAILLE_PAGE) => liste.slice((page - 1) * taille, page * taille);

/** Navigation « Précédent / Suivant » qui conserve les autres paramètres de l'adresse (filtres, mois). */
export default function Pagination({
  page,
  total,
  chemin,
  params = {},
  taille = TAILLE_PAGE,
}: {
  page: number;
  total: number;
  chemin: string;
  params?: Record<string, string | undefined>;
  taille?: number;
}) {
  const pages = Math.max(1, Math.ceil(total / taille));
  if (pages <= 1) return null;
  const lien = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `${chemin}?${s}` : chemin;
  };
  const style = "inline-flex items-center gap-1 h-11 px-space-md rounded-xl bg-surface-container-lowest shadow-sm text-primary font-label-lg text-label-lg font-semibold hover:bg-surface-container";
  const inactif = "inline-flex items-center gap-1 h-11 px-space-md rounded-xl bg-surface-container text-on-surface-variant font-label-lg text-label-lg opacity-60";
  const courante = Math.min(page, pages);
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-space-sm py-space-md">
      {courante > 1 ? (
        <Link href={lien(courante - 1)} className={style}>
          <span className="material-symbols-outlined text-[20px]">chevron_left</span> Précédent
        </Link>
      ) : (
        <span className={inactif}><span className="material-symbols-outlined text-[20px]">chevron_left</span> Précédent</span>
      )}
      <span className="font-body-md text-body-md text-on-surface-variant">Page {courante} sur {pages}</span>
      {courante < pages ? (
        <Link href={lien(courante + 1)} className={style}>
          Suivant <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </Link>
      ) : (
        <span className={inactif}>Suivant <span className="material-symbols-outlined text-[20px]">chevron_right</span></span>
      )}
    </nav>
  );
}
