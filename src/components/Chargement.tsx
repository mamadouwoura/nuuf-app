/** Écran d'attente aux couleurs de Nuuf : logo qui respire dans un anneau animé, mot-symbole et barre de progression. */
export default function Chargement({ plein = false, libelle }: { plein?: boolean; libelle?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={libelle}
      className={`flex items-center justify-center ${plein ? "fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm" : "w-full min-h-[60vh] py-space-lg"}`}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <span className="nuuf-onde absolute inset-0 rounded-full bg-primary/15" />
          <span className="nuuf-onde nuuf-onde-2 absolute inset-0 rounded-full bg-primary/10" />
          <span className="nuuf-anneau absolute inset-0 rounded-full border-[3px] border-primary/15 border-t-primary" />
          <span className="nuuf-logo relative w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="font-headline-lg font-black lowercase leading-none text-3xl -mt-0.5">n</span>
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-secondary-container" />
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-headline-md font-extrabold lowercase tracking-tight text-primary text-xl">nuuf</span>
          <span className="nuuf-barre relative block w-28 h-1 rounded-full bg-primary/15 overflow-hidden" />
          {libelle && <span className="font-body-sm text-body-sm text-on-surface-variant">{libelle}</span>}
        </div>
      </div>
    </div>
  );
}
